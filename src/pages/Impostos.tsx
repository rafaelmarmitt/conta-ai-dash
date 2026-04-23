import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckCircle2, Receipt, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const historico = [
  { mes: "Junho/2025", valor: 75.9, status: "pendente", venc: "20/07/2025" },
  { mes: "Maio/2025", valor: 75.9, status: "pago", venc: "20/06/2025" },
  { mes: "Abril/2025", valor: 71.6, status: "pago", venc: "20/05/2025" },
  { mes: "Março/2025", valor: 71.6, status: "pago", venc: "20/04/2025" },
  { mes: "Fevereiro/2025", valor: 71.6, status: "pago", venc: "20/03/2025" },
];

const Impostos = () => {
  const [checked, setChecked] = useState(false);
  return (
    <DashboardLayout title="Impostos — DAS MEI" subtitle="Acompanhe e quite seu imposto mensal">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 shadow-card lg:col-span-2 gradient-soft border-primary/20">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DAS deste mês</p>
              <p className="text-4xl font-bold text-primary mt-1">R$ 75,90</p>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" /> Vence em <span className="font-semibold text-foreground">20/07/2025</span>
              </p>
            </div>
            <Badge className="bg-warning text-warning-foreground border-0">Pendente</Badge>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card mb-4 border border-border">
            <Checkbox id="pago" checked={checked} onCheckedChange={(v) => setChecked(!!v)} />
            <label htmlFor="pago" className="text-sm font-medium cursor-pointer flex-1">
              Já paguei o boleto deste mês
            </label>
            {checked && <CheckCircle2 className="h-5 w-5 text-success" />}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" onClick={() => toast.success("Boleto baixado!")}>
              <Download className="h-4 w-4" /> Gerar boleto DAS
            </Button>
            <Button variant="outline">Ver instruções</Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <h2 className="text-base font-bold mb-1">Resumo do ano</h2>
          <p className="text-xs text-muted-foreground mb-4">Janeiro a Dezembro 2025</p>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-success-soft">
              <span className="text-sm font-medium text-success-foreground">Pagos</span>
              <span className="text-lg font-bold text-success-foreground">5</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-warning-soft">
              <span className="text-sm font-medium text-warning">Pendentes</span>
              <span className="text-lg font-bold text-warning">1</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted">
              <span className="text-sm font-medium">Total pago</span>
              <span className="text-lg font-bold">R$ 362,30</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-card lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-base font-bold">Histórico de pagamentos</h2>
          </div>
          <div className="space-y-2">
            {historico.map((h) => (
              <div key={h.mes} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border hover:bg-muted/40 transition-smooth">
                <div>
                  <p className="text-sm font-semibold text-foreground">{h.mes}</p>
                  <p className="text-xs text-muted-foreground">Vencimento: {h.venc}</p>
                </div>
                <p className="text-sm font-bold text-foreground">R$ {h.valor.toFixed(2).replace(".", ",")}</p>
                {h.status === "pago" ? (
                  <Badge className="bg-success-soft text-success-foreground border-0">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Pago
                  </Badge>
                ) : (
                  <Badge className="bg-warning text-warning-foreground border-0">Pendente</Badge>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Impostos;
