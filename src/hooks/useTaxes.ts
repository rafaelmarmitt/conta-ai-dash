import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TaxStatus = "pendente" | "pago" | "vencido";

export interface TaxRow {
  id: string;
  user_id: string;
  month_reference: string; // ex: "Janeiro/2024"
  due_date: string | null; // ISO date
  amount: number;
  status: TaxStatus;
  pix_code: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export const MESES_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function buildMonthRef(monthIdx: number, year: number) {
  return `${MESES_PT[monthIdx]}/${year}`;
}

export function defaultDueDate(monthIdx: number, year: number) {
  // Vencimento padrão: dia 20 do mês de referência
  const d = new Date(year, monthIdx, 20);
  return d.toISOString().slice(0, 10);
}

export function computeStatus(row: Pick<TaxRow, "status" | "due_date">): TaxStatus {
  if (row.status === "pago") return "pago";
  if (row.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(row.due_date);
    due.setHours(0, 0, 0, 0);
    if (due < today) return "vencido";
  }
  return "pendente";
}

/**
 * Hook para gerenciar a tabela `taxes` (DAS MEI) com realtime.
 * Atualiza automaticamente quando o N8N (ou o próprio painel) mexe nos registos.
 */
export function useTaxes(year: number = new Date().getFullYear()) {
  const { user } = useAuth();
  const [rows, setRows] = useState<TaxRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaxes = useCallback(async () => {
    if (!user) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("taxes")
      .select("*")
      .eq("user_id", user.id)
      .like("month_reference", `%/${year}`);
    if (!error && data) setRows(data as TaxRow[]);
    setLoading(false);
  }, [user, year]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  // Realtime — qualquer INSERT/UPDATE/DELETE em taxes do usuário recarrega
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`taxes-rt-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "taxes", filter: `user_id=eq.${user.id}` },
        () => fetchTaxes()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchTaxes]);

  const byMonth = useMemo(() => {
    const map = new Map<string, TaxRow>();
    rows.forEach((r) => map.set(r.month_reference, r));
    return map;
  }, [rows]);

  return { rows, byMonth, loading, refetch: fetchTaxes };
}
