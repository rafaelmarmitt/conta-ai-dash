import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CopyButton } from "@/components/CopyButton";
import {
  CalendarClock, CheckCircle2, Receipt, Download, AlertTriangle,
  TrendingUp, FileText, Bell, Calculator
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MockBadge } from "@/components/MockBadge";

interface HistItem { mes: string; valor: number; status: string; venc: string; codigo: string; }

const HISTORICO_MOCK: HistItem[] = [
  { mes: "Junho/2025", valor: 75.9, status: "pendente", venc: "20/07/2025", codigo: "85800000007 590120250 720250000 099912345" },
  { mes: "Maio/2025", valor: 75.9, status: "pago", venc: "20/06/2025", codigo: "85800000007 590120250 620250000 088812345" },
  { mes: "Abril/2025", valor: 71.6, status: "pago", venc: "20/05/2025", codigo: "85800000007 160120250 520250000 077712345" },
  { mes: "Março/2025", valor: 71.6, status: "pago", venc: "20/04/2025", codigo: "85800000007 160120250 420250000 066612345" },
  { mes: "Fevereiro/2025", valor: 71.6, status: "pago", venc: "20/03/2025", codigo: "85800000007 160120250 320250000 055512345" },
  { mes: "Janeiro/2025", valor: 71.6, status: "pago", venc: "20/02/2025", codigo: "85800000007 160120250 220250000 044412345" },
];

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

const Impostos = () => {
  const { user } = useAuth();
  const [checked, setChecked] = useState(false);
  const [historico, setHistorico] = useState<HistItem[]>(HISTORICO_MOCK);
  const [isMock, setIsMock] = useState(true);
  const [revenue12m, setRevenue12m] = useState(56400);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const { data: taxes } = await supabase.from("taxes").select("*").eq("user_id", user.id).order("reference_year", { ascending: false }).order("reference_month", { ascending: false });
      if (taxes && taxes.length > 0) {
        setHistorico(taxes.map((t: any) => ({
          mes: `${MESES[t.reference_month - 1]}/${t.reference_year}`,
          valor: Number(t.das_amount),
          status: t.status,
          venc: t.due_date ? new Date(t.due_date).toLocaleDateString("pt-BR") : "—",
          codigo: t.notes || "",
        })));
        setIsMock(false);
        const acc = taxes.reduce((s: number, t: any) => s + Number(t.revenue || 0), 0);
        if (acc > 0) setRevenue12m(acc);
      }
    };
    load();
  }, [user]);

  const limite = { label: "Receita acumulada (12 meses)", valor: revenue12m, max: 81000 };
  const pctLimite = (limite.valor / limite.max) * 100;

  return (
    <DashboardLayout
      title="Impostos — DAS MEI"
      subtitle="Controle total dos seus boletos e enquadramento MEI"
      actions={
        <Button variant="outline" className="rounded-xl">
          <Bell className="h-4 w-4" /> Configurar lembretes
        </Button>
      }
    >
      <div className="mb-4"><MockBadge show={isMock} /></div>
      {/* Alerta de vencimento */}
      <Card className="p-5 shadow-coral mb-6 bg-warning-soft border-warning/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-warning/20 blur-2xl animate-blob" />
        <div className="relative flex items-start gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-warning text-warning-foreground flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-bold text-foreground">DAS de Junho vence em 12 dias</p>
            <p className="text-sm text-muted-foreground">Evite multa de 0,33% ao dia + juros Selic. Quite até <span className="font-bold text-warning-foreground">20/07/2025</span>.</p>
          </div>
          <Button variant="hero" className="rounded-xl">
            <Download className="h-4 w-4" /> Pagar agora
          </Button>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* DAS atual */}
        <Card className="p-6 shadow-card lg:col-span-2 gradient-mesh border-primary/20 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-5 flex-wrap">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">DAS deste mês</p>
                <p className="text-5xl font-extrabold text-gradient-primary">R$ 75,90</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4" /> Vence em <span className="font-bold text-foreground">20/07/2025</span>
                </p>
              </div>
              <Badge className="bg-warning text-warning-foreground border-0 font-bold text-sm px-3 py-1">Pendente</Badge>
            </div>

            <div className="rounded-2xl bg-card p-4 mb-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <Checkbox id="pago" checked={checked} onCheckedChange={(v) => setChecked(!!v)} className="h-5 w-5" />
                <label htmlFor="pago" className="text-sm font-semibold cursor-pointer flex-1">
                  Já paguei o boleto deste mês
                </label>
                {checked && <CheckCircle2 className="h-5 w-5 text-success animate-scale-in" />}
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted">
                <code className="flex-1 text-[11px] font-mono text-muted-foreground truncate">
                  85800000007 590120250 720250000 099912345
                </code>
                <CopyButton text="85800000007590120250720250000099912345" label="Copiar" size="sm" variant="outline" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="hero" onClick={() => toast.success("Boleto baixado!")}>
                <Download className="h-4 w-4" /> Baixar boleto PDF
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4" /> Ver instruções
              </Button>
            </div>
          </div>
        </Card>

        {/* Resumo do ano */}
        <Card className="p-6 shadow-card">
          <h2 className="text-base font-bold mb-1">Resumo de 2025</h2>
          <p className="text-xs text-muted-foreground mb-4">Janeiro a Dezembro</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-success-soft border border-success/20">
              <span className="text-sm font-semibold text-success-deep flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Pagos
              </span>
              <span className="text-2xl font-extrabold text-success-deep">5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-warning-soft border border-warning/20">
              <span className="text-sm font-semibold text-warning-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Pendentes
              </span>
              <span className="text-2xl font-extrabold text-warning-foreground">1</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl gradient-primary text-primary-foreground">
              <span className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="h-4 w-4" /> Total pago
              </span>
              <span className="text-xl font-extrabold">R$ 362,30</span>
            </div>
          </div>
        </Card>

        {/* Limite MEI */}
        <Card className="p-6 shadow-card lg:col-span-3">
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl gradient-info flex items-center justify-center shadow-glow">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-bold">Limite de faturamento MEI</h2>
                <p className="text-xs text-muted-foreground">Acompanhe para não estourar o teto de R$ 81.000/ano</p>
              </div>
            </div>
            <Badge className="bg-info-soft text-info border-0 font-bold">
              {pctLimite.toFixed(0)}% do limite
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">R$ {limite.valor.toLocaleString("pt-BR")}</span>
              <span className="text-muted-foreground">de R$ {limite.max.toLocaleString("pt-BR")}</span>
            </div>
            <Progress value={pctLimite} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Você ainda pode faturar <span className="font-bold text-foreground">R$ {(limite.max - limite.valor).toLocaleString("pt-BR")}</span> este ano sem mudar de regime.
            </p>
          </div>
        </Card>

        {/* Histórico */}
        <Card className="p-6 shadow-card lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Histórico de pagamentos</h2>
              <p className="text-xs text-muted-foreground">{historico.length} boletos nos últimos meses</p>
            </div>
          </div>
          <div className="space-y-2">
            {historico.map((h, i) => (
              <div
                key={h.mes}
                className="grid grid-cols-12 items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/30 transition-smooth animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="col-span-12 sm:col-span-3">
                  <p className="text-sm font-bold text-foreground">{h.mes}</p>
                  <p className="text-xs text-muted-foreground">Vencimento: {h.venc}</p>
                </div>
                <div className="col-span-6 sm:col-span-3">
                  <p className="text-lg font-extrabold text-foreground">R$ {h.valor.toFixed(2).replace(".", ",")}</p>
                </div>
                <div className="col-span-6 sm:col-span-3 text-right sm:text-left">
                  {h.status === "pago" ? (
                    <Badge className="bg-success-soft text-success-deep border-0 font-semibold">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Pago
                    </Badge>
                  ) : (
                    <Badge className="bg-warning text-warning-foreground border-0 font-semibold">Pendente</Badge>
                  )}
                </div>
                <div className="col-span-12 sm:col-span-3 flex justify-start sm:justify-end gap-1">
                  <CopyButton text={h.codigo.replace(/\s/g, "")} variant="ghost" />
                  <Button size="icon" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Impostos;
