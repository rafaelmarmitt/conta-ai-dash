import { DashboardLayout } from "@/components/DashboardLayout";
import { CopyButton } from "@/components/CopyButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle, Activity,
  Send, MessageSquareText, Bot, Clock, Check, CheckCheck
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";

const comandos = [
  { cmd: "vendi 150 bolo", desc: "Registra uma entrada (venda) de R$ 150", cat: "Financeiro" },
  { cmd: "gastei 80 fornecedor", desc: "Registra uma saída (despesa)", cat: "Financeiro" },
  { cmd: "saldo", desc: "Mostra o saldo do mês atual", cat: "Consulta" },
  { cmd: "relatório", desc: "Recebe o resumo financeiro semanal", cat: "Consulta" },
  { cmd: "das", desc: "Consulta status do imposto DAS", cat: "Impostos" },
  { cmd: "novo cliente João 11999", desc: "Adiciona cliente ao CRM", cat: "Clientes" },
  { cmd: "produto bolo 180", desc: "Cadastra novo produto no catálogo", cat: "Catálogo" },
  { cmd: "lembrar pagamento amanhã", desc: "Cria um lembrete automático", cat: "Lembretes" },
];

const conversa = [
  { from: "user", text: "vendi 180 bolo decorado pra Maria", time: "14:32" },
  { from: "bot", text: "✅ Venda registrada!\n\n💰 R$ 180,00\n🎂 Bolo decorado\n👤 Cliente: Maria\n\nSeu saldo do mês: R$ 7.300,00", time: "14:32" },
  { from: "user", text: "saldo", time: "14:35" },
  { from: "bot", text: "📊 Resumo de Junho/2025\n\n💚 Entradas: R$ 7.300,00\n💸 Saídas: R$ 3.400,00\n🏆 Lucro: R$ 3.900,00\n\nVocê está 91% da meta! 🚀", time: "14:35" },
];

const atividade24h = [
  { h: "00h", msgs: 0 }, { h: "04h", msgs: 0 }, { h: "08h", msgs: 4 },
  { h: "10h", msgs: 12 }, { h: "12h", msgs: 18 }, { h: "14h", msgs: 24 },
  { h: "16h", msgs: 16 }, { h: "18h", msgs: 9 }, { h: "20h", msgs: 6 }, { h: "22h", msgs: 2 },
];

const cats = ["Todos", "Financeiro", "Consulta", "Impostos", "Clientes", "Catálogo", "Lembretes"];

const WhatsAppPage = () => {
  const [filtro, setFiltro] = useState("Todos");
  const filtrados = filtro === "Todos" ? comandos : comandos.filter((c) => c.cat === filtro);

  return (
    <DashboardLayout
      title="WhatsApp & Conexão"
      subtitle="Gerencie seu bot e veja a integração em tempo real"
      actions={
        <Button variant="success" className="rounded-xl" onClick={() => toast.success("Mensagem de teste enviada!")}>
          <Send className="h-4 w-4" /> Enviar teste
        </Button>
      }
    >
      {/* Status cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card className="p-5 shadow-card border-success/30 bg-success-soft/40 relative overflow-hidden">
          <div className="absolute top-3 right-3 flex items-center justify-center h-10 w-10 rounded-full">
            <span className="absolute inline-flex h-3 w-3 rounded-full bg-success animate-pulse-ring" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
          </div>
          <p className="text-xs font-bold uppercase text-success-deep tracking-wider">Status do Bot</p>
          <p className="text-2xl font-extrabold text-success-deep mt-1">Conectado</p>
          <p className="text-xs text-muted-foreground mt-1">Última sync: agora</p>
        </Card>
        <Card className="p-5 shadow-card hover-lift">
          <Activity className="h-5 w-5 text-info mb-2" />
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Mensagens hoje</p>
          <p className="text-2xl font-extrabold mt-1">91</p>
          <p className="text-xs text-success-deep font-semibold mt-1">+12% vs ontem</p>
        </Card>
        <Card className="p-5 shadow-card hover-lift">
          <Clock className="h-5 w-5 text-coral mb-2" />
          <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Tempo médio</p>
          <p className="text-2xl font-extrabold mt-1">1.2s</p>
          <p className="text-xs text-muted-foreground mt-1">resposta do bot</p>
        </Card>
      </div>

      <Tabs defaultValue="conexao" className="w-full">
        <TabsList className="mb-5 bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="conexao" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Conexão</TabsTrigger>
          <TabsTrigger value="conversa" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Preview do bot</TabsTrigger>
          <TabsTrigger value="comandos" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Comandos</TabsTrigger>
        </TabsList>

        <TabsContent value="conexao" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-6 shadow-card lg:col-span-2">
              <div className="flex items-start gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold">Número Cadastrado</h2>
                  <p className="text-xs text-muted-foreground">O bot responde mensagens enviadas para este número</p>
                </div>
                <Badge className="bg-success-soft text-success-deep border-0">Verificado ✓</Badge>
              </div>
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="ddi">País</Label>
                  <Input id="ddi" defaultValue="🇧🇷 +55 (Brasil)" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <div className="flex gap-2">
                    <Input id="phone" defaultValue="(11) 98765-4321" />
                    <CopyButton text="+5511987654321" variant="outline" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <div>
                    <p className="text-sm font-semibold">Respostas automáticas</p>
                    <p className="text-xs text-muted-foreground">Bot responde 24/7 mesmo offline</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
                  <div>
                    <p className="text-sm font-semibold">Notificações por venda</p>
                    <p className="text-xs text-muted-foreground">Receber resumo a cada nova entrada</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button variant="success" onClick={() => toast.success("Número atualizado com sucesso!")}>
                  Salvar alterações
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>