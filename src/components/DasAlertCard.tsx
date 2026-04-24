import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTaxes, buildMonthRef, computeStatus } from "@/hooks/useTaxes";

/**
 * Card de alerta de DAS exibido no Dashboard:
 * - Amarelo se o DAS do mês corrente está pendente
 * - Vermelho se está vencido
 * - Verde discreto se está pago
 */
export function DasAlertCard() {
  const now = new Date();
  const monthIdx = now.getMonth();
  const year = now.getFullYear();
  const { byMonth, loading } = useTaxes(year);
  const monthRef = buildMonthRef(monthIdx, year);
  const tax = byMonth.get(monthRef);

  if (loading) return null;

  const status = tax ? computeStatus(tax) : "pendente";
  const dueDay = 20;
  const dueDate = new Date(year, monthIdx, dueDay);
  const today = new Date(); today.setHours(0,0,0,0);
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (status === "pago") {
    return (
      <Card className="p-5 mb-6 bg-success-soft border-success/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-success/20 blur-2xl" />
        <div className="relative flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-2xl bg-success text-success-foreground flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="font-bold text-foreground">DAS de {monthRef.split("/")[0]} pago ✅</p>
            <p className="text-sm text-muted-foreground">Você está em dia com a Receita Federal.</p>
          </div>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/impostos">Ver impostos <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </Card>
    );
  }

  const isVencido = status === "vencido";
  const wrapperCls = isVencido
    ? "bg-destructive/10 border-destructive/40"
    : "bg-warning-soft border-warning/40";
  const iconCls = isVencido
    ? "bg-destructive text-destructive-foreground"
    : "bg-warning text-warning-foreground";
  const blobCls = isVencido ? "bg-destructive/20" : "bg-warning/20";
  const badgeCls = isVencido
    ? "bg-destructive text-destructive-foreground border-0"
    : "bg-warning text-warning-foreground border-0";

  return (
    <Card className={`p-5 mb-6 relative overflow-hidden border ${wrapperCls}`}>
      <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full ${blobCls} blur-2xl animate-blob`} />
      <div className="relative flex items-start gap-4 flex-wrap">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${iconCls}`}>
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-foreground">
              {isVencido
                ? `DAS de ${monthRef.split("/")[0]} está vencido!`
                : diffDays > 0
                  ? `DAS de ${monthRef.split("/")[0]} vence em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`
                  : `DAS de ${monthRef.split("/")[0]} vence hoje`}
            </p>
            <Badge className={badgeCls}>{isVencido ? "Vencido" : "Pendente"}</Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4" />
            {isVencido
              ? "Multa de 0,33% ao dia + juros Selic. Regularize o quanto antes."
              : <>Vencimento em <span className="font-bold text-foreground">{dueDate.toLocaleDateString("pt-BR")}</span>.</>}
          </p>
        </div>
        <Button variant={isVencido ? "destructive" : "hero"} className="rounded-xl" asChild>
          <Link to="/impostos">
            {isVencido ? "Regularizar agora" : "Pagar DAS"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
