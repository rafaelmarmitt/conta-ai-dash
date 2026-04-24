import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { CopyButton } from "@/components/CopyButton";
import { ComoPagarDasModal } from "@/components/ComoPagarDasModal";
import {
  AlertTriangle, CalendarClock, CheckCircle2, Clock, Edit3,
  PiggyBank, Receipt, Sparkles, XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import {
  buildMonthRef, computeStatus, defaultDueDate, MESES_PT, useTaxes, type TaxRow,
} from "@/hooks/useTaxes";

const DEFAULT_DAS_AMOUNT = 75.9; // valor sugerido do DAS Comércio/Indústria 2025

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Impostos = () => {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const { rows, byMonth, loading, refetch } = useTaxes(year);

  const [defaultAmount, setDefaultAmount] = useState<number>(DEFAULT_DAS_AMOUNT);
  const [editing, setEditing] = useState<{ row?: TaxRow; monthIdx: number } | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editPix, setEditPix] = useState("");
  const [saving, setSaving] = useState(false);

  // Detectar valor mais recente já cadastrado e usar como sugerido
  useEffect(() => {
    if (rows.length > 0) {
      const last = [...rows].sort((a, b) => (b.created_at > a.created_at ? 1 : -1))[0];
      if (last?.amount && Number(last.amount) > 0) setDefaultAmount(Number(last.amount));
    }
  }, [rows]);

  const months = useMemo(() => {
    return MESES_PT.map((nome, idx) => {
      const monthRef = buildMonthRef(idx, year);
      const row = byMonth.get(monthRef);
      const status = row ? computeStatus(row) : "pendente";
      return { idx, nome, monthRef, row, status };
    });
  }, [byMonth, year]);

  const stats = useMemo(() => {
    const pagos = months.filter((m) => m.status === "pago").length;
    const vencidos = months.filter((m) => m.status === "vencido").length;
    const pendentes = months.filter((m) => m.status === "pendente").length;
    const totalPago = months.reduce(
      (s, m) => s + (m.status === "pago" ? Number(m.row?.amount || 0) : 0),
      0,
    );
    return { pagos, vencidos, pendentes, totalPago };
  }, [months]);

  const chartData = [
    { name: "Pagos", value: stats.pagos, color: "hsl(var(--success))" },
    { name: "Pendentes", value: stats.pendentes, color: "hsl(var(--muted-foreground))" },
    { name: "Vencidos", value: stats.vencidos, color: "hsl(var(--destructive))" },
  ].filter((d) => d.value > 0);

  // CRUD ----------------------------------------------------------------
  const upsertTax = async (
    monthIdx: number,
    patch: Partial<TaxRow>,
  ): Promise<TaxRow | null> => {
    if (!user) return null;
    const monthRef = buildMonthRef(monthIdx, year);
    const existing = byMonth.get(monthRef);
    if (existing) {
      const { data, error } = await supabase
        .from("taxes")
        .update(patch)
        .eq("id", existing.id)
        .select()
        .maybeSingle();
      if (error) { toast.error(error.message); return null; }
      return data as TaxRow;
    }
    const { data, error } = await supabase
      .from("taxes")
      .insert({
        user_id: user.id,
        month_reference: monthRef,
        due_date: defaultDueDate(monthIdx, year),
        amount: defaultAmount,
        status: "pendente",
        ...patch,
      })
      .select()
      .maybeSingle();
    if (error) { toast.error(error.message); return null; }
    return data as TaxRow;
  };

  const marcarPago = async (monthIdx: number) => {
    const ok = await upsertTax(monthIdx, {
      status: "pago",
      paid_at: new Date().toISOString(),
    });
    if (ok) {
      toast.success(`DAS de ${MESES_PT[monthIdx]} marcado como pago! ✅`);
      refetch();
    }
  };

  const desmarcarPago = async (row: TaxRow) => {
    const { error } = await supabase
      .from("taxes")
      .update({ status: "pendente", paid_at: null })
      .eq("id", row.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Pagamento desfeito.");
    refetch();
  };

  const openEdit = (monthIdx: number, row?: TaxRow) => {
    setEditing({ monthIdx, row });
    setEditAmount(String(row?.amount ?? defaultAmount));
    setEditPix(row?.pix_code ?? "");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const amountNum = Number(editAmount.replace(",", "."));
    const ok = await upsertTax(editing.monthIdx, {
      amount: isNaN(amountNum) ? defaultAmount : amountNum,
      pix_code: editPix.trim() || null,
    });
    setSaving(false);
    if (ok) {
      toast.success("Informações atualizadas.");
      setEditing(null);
      refetch();
    }
  };

  return (
    <DashboardLayout
      title="Impostos — DAS MEI"
      subtitle="Acompanhe os boletos do ano e marque os pagamentos."
      actions={
        <>
          <ComoPagarDasModal />
        </>
      }
    >
      {/* Configuração do valor padrão + ano */}
      <Card className="p-5 mb-6 shadow-card">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ano-select" className="text-xs uppercase tracking-wider text-muted-foreground">
              Ano de referência
            </Label>
            <select
              id="ano-select"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {[now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px] max-w-[280px]">
            <Label htmlFor="default-das" className="text-xs uppercase tracking-wider text-muted-foreground">
              Valor sugerido do DAS (R$)
            </Label>
            <Input
              id="default-das"
              inputMode="decimal"
              value={String(defaultAmount).replace(".", ",")}
              onChange={(e) => {
                const v = Number(e.target.value.replace(",", "."));
                if (!isNaN(v)) setDefaultAmount(v);
              }}
              className="h-10 rounded-xl"
            />
            <p className="text-[11px] text-muted-foreground">
              Esse valor é usado quando você gera o registro de um mês novo.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <Badge className="bg-success-soft text-success-deep border-0 font-semibold">
              <CheckCircle2 className="h-3 w-3 mr-1" /> {stats.pagos} pagos
            </Badge>
            <Badge className="bg-muted text-foreground border-0 font-semibold">
              <Clock className="h-3 w-3 mr-1" /> {stats.pendentes} pendentes
            </Badge>
            <Badge className="bg-destructive/15 text-destructive border-0 font-semibold">
              <XCircle className="h-3 w-3 mr-1" /> {stats.vencidos} vencidos
            </Badge>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Tabela mensal */}
        <Card className="p-5 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">DAS de {year}</h2>
              <p className="text-xs text-muted-foreground">12 obrigações mensais — vencimento todo dia 20</p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {months.map((m, i) => {
                const isPago = m.status === "pago";
                const isVencido = m.status === "vencido";
                const isCurrent = m.idx === now.getMonth() && year === now.getFullYear();
                return (
                  <div
                    key={m.monthRef}
                    className={`grid grid-cols-12 items-center gap-3 p-4 rounded-xl border transition-smooth animate-fade-in ${
                      isPago
                        ? "border-success/20 bg-success-soft/40"
                        : isVencido
                          ? "border-destructive/30 bg-destructive/5"
                          : isCurrent
                            ? "border-primary/30 bg-primary-soft/30"
                            : "border-border hover:border-primary/30 hover:bg-muted/30"
                    }`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="col-span-12 sm:col-span-3">
                      <p className="text-sm font-bold text-foreground flex items-center gap-2">
                        {m.nome}
                        {isCurrent && (
                          <Badge className="bg-primary text-primary-foreground border-0 text-[10px] px-1.5 py-0">
                            Atual
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <CalendarClock className="h-3 w-3" />
                        Vence 20/{String(m.idx + 1).padStart(2, "0")}/{year}
                      </p>
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <p className="text-lg font-extrabold text-foreground">
                        {formatBRL(Number(m.row?.amount ?? defaultAmount))}
                      </p>
                      {m.row?.pix_code && (
                        <p className="text-[10px] text-muted-foreground truncate">Pix salvo ✓</p>
                      )}
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      {isPago ? (
                        <Badge className="bg-success text-success-foreground border-0 font-semibold">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Pago
                        </Badge>
                      ) : isVencido ? (
                        <Badge className="bg-destructive text-destructive-foreground border-0 font-semibold">
                          <AlertTriangle className="h-3 w-3 mr-1" /> Vencido
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-foreground border-0 font-semibold">
                          <Clock className="h-3 w-3 mr-1" /> Pendente
                        </Badge>
                      )}
                    </div>

                    <div className="col-span-12 sm:col-span-3 flex flex-wrap justify-start sm:justify-end gap-1.5">
                      {m.row?.pix_code && (
                        <CopyButton text={m.row.pix_code} variant="ghost" />
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(m.idx, m.row)}
                        aria-label={`Editar DAS de ${m.nome}`}
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      {isPago ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => m.row && desmarcarPago(m.row)}
                        >
                          Desfazer
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="hero"
                          onClick={() => marcarPago(m.idx)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Marcar pago
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Gráfico Saúde Fiscal */}
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold">Saúde Fiscal {year}</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Pagos vs. pendentes vs. vencidos
          </p>
          <div className="h-56 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem registros ainda neste ano.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-4 p-4 rounded-xl gradient-mesh border border-primary/20">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-1">
              <PiggyBank className="h-4 w-4" /> Total pago em {year}
            </div>
            <p className="text-3xl font-extrabold text-foreground">{formatBRL(stats.totalPago)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Equivalente a {stats.pagos} {stats.pagos === 1 ? "mês" : "meses"} de DAS quitados.
            </p>
          </div>
        </Card>
      </div>

      {/* Modal de edição */}
      <Dialog open={!!editing} onOpenChange={(v) => !v && !saving && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? `DAS de ${MESES_PT[editing.monthIdx]}/${year}` : ""}
            </DialogTitle>
            <DialogDescription>
              Atualize o valor e cole o código Pix copia-e-cola, se quiser guardar para depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-amount">Valor (R$)</Label>
              <Input
                id="edit-amount"
                inputMode="decimal"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                placeholder="75,90"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-pix">Código Pix (opcional)</Label>
              <Input
                id="edit-pix"
                value={editPix}
                onChange={(e) => setEditPix(e.target.value)}
                placeholder="00020126..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              Cancelar
            </Button>
            <Button variant="hero" onClick={saveEdit} disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Impostos;
