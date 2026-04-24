-- 1. Garantir valor 'vencido' no enum tax_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'tax_status' AND e.enumlabel = 'vencido'
  ) THEN
    ALTER TYPE public.tax_status ADD VALUE 'vencido';
  END IF;
END$$;

-- 2. Reestruturar colunas da tabela taxes
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS month_reference TEXT;
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.taxes ADD COLUMN IF NOT EXISTS pix_code TEXT;

-- Migrar dados antigos para month_reference quando possível
UPDATE public.taxes
SET month_reference = CASE reference_month
    WHEN 1 THEN 'Janeiro' WHEN 2 THEN 'Fevereiro' WHEN 3 THEN 'Março'
    WHEN 4 THEN 'Abril'   WHEN 5 THEN 'Maio'      WHEN 6 THEN 'Junho'
    WHEN 7 THEN 'Julho'   WHEN 8 THEN 'Agosto'    WHEN 9 THEN 'Setembro'
    WHEN 10 THEN 'Outubro' WHEN 11 THEN 'Novembro' WHEN 12 THEN 'Dezembro'
  END || '/' || reference_year::text
WHERE month_reference IS NULL AND reference_month IS NOT NULL AND reference_year IS NOT NULL;

UPDATE public.taxes SET amount = das_amount WHERE amount = 0 AND das_amount > 0;

-- Tornar month_reference NOT NULL (após backfill)
ALTER TABLE public.taxes ALTER COLUMN month_reference SET NOT NULL;

-- Remover colunas antigas
ALTER TABLE public.taxes DROP COLUMN IF EXISTS reference_month;
ALTER TABLE public.taxes DROP COLUMN IF EXISTS reference_year;
ALTER TABLE public.taxes DROP COLUMN IF EXISTS revenue;
ALTER TABLE public.taxes DROP COLUMN IF EXISTS das_amount;
ALTER TABLE public.taxes DROP COLUMN IF EXISTS notes;

-- Garantir unicidade de (user_id, month_reference)
CREATE UNIQUE INDEX IF NOT EXISTS taxes_user_month_uq
  ON public.taxes (user_id, month_reference);

-- 3. Trigger de updated_at (caso ainda não exista)
DROP TRIGGER IF EXISTS update_taxes_updated_at ON public.taxes;
CREATE TRIGGER update_taxes_updated_at
  BEFORE UPDATE ON public.taxes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Habilitar realtime na tabela taxes (para refletir updates do N8N instantaneamente)
ALTER TABLE public.taxes REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'taxes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.taxes;
  END IF;
END$$;