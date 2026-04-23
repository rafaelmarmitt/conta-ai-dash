import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Wifi, RefreshCw, Smartphone } from "lucide-react";
import { toast } from "sonner";

const comandos = [
  { cmd: "vendi 150 bolo", desc: "Registra uma entrada (venda) de R$ 150" },
  { cmd: "gastei 80 fornecedor", desc: "Registra uma saída (despesa)" },
  { cmd: "saldo", desc: "Mostra o saldo do mês atual" },
  { cmd: "relatório", desc: "Recebe o resumo financeiro semanal" },
  { cmd: "das", desc: "Consulta status do imposto DAS" },
  { cmd: "novo cliente João 11999", desc: "Adiciona cliente ao CRM" },
];

const WhatsApp = () => {
  return (
    <DashboardLayout title="WhatsApp & Conexão" subtitle="Gerencie seu bot e a integração com o N8N">
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 shadow-card lg:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Número Cadastrado</h2>
              <p className="text-xs text-muted-foreground">O bot responde mensagens enviadas para este número</p>
            </div>
          </div>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="ddi">País</Label>
              <Input id="ddi" defaultValue="+55 (Brasil)" disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp</Label>
              <Input id="phone" defaultValue="(11) 98765-4321" />
            </div>
            <Button variant="success" onClick={() => toast.success("Número atualizado com sucesso!")}>Salvar alterações</Button>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-success-soft flex items-center justify-center">
              <Wifi className="h-5 w-5 text-success-foreground" />
            </div>
            <div>
              <h2 className="text-base font-bold">Status N8N</h2>
              <p className="text-xs text-muted-foreground">Workflow de integração</p>
            </div>
          </div>
          <div className="rounded-2xl bg-success-soft p-4 mb-4">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
              </span>
              <div>
                <p className="text-sm font-bold text-success-foreground">Conectado</p>
                <p className="text-xs text-success-foreground/70">Última sincronia: agora mesmo</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => toast("Reconectando...")}>
            <RefreshCw className="h-4 w-4" /> Reconectar
          </Button>
        </Card>

        <Card className="p-6 shadow-card lg:col-span-3">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Guia rápido de comandos</h2>
              <p className="text-xs text-muted-foreground">Envie estas mensagens no WhatsApp para o bot</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {comandos.map((c) => (
              <div key={c.cmd} className="flex items-start gap-3 p-3 rounded-xl border border-border bg-muted/30">
                <Badge className="bg-primary text-primary-foreground border-0 font-mono text-xs shrink-0">{c.cmd}</Badge>
                <p className="text-sm text-muted-foreground">{c.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WhatsApp;
