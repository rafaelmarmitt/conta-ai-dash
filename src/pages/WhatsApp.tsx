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
                  <Bot className="h-5 w-5 text-primary-foreground" />
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

            <Card className="p-5 shadow-card">
              <h3 className="text-sm font-bold mb-1">Atividade nas últimas 24h</h3>
              <p className="text-xs text-muted-foreground mb-4">Mensagens processadas pelo bot</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={atividade24h} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="hsl(var(--primary))" />
                        <stop offset="100%" stopColor="hsl(var(--success))" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="h" fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                    <Line type="monotone" dataKey="msgs" stroke="url(#lineG)" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversa" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-0 shadow-card lg:col-span-2 overflow-hidden">
              <div className="bg-whatsapp text-white px-4 py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Conta.AI Bot</p>
                  <p className="text-[11px] opacity-90 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                    online — digitando...
                  </p>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-[10px]">Mock</Badge>
              </div>
              <div
                className="p-5 space-y-3 min-h-[420px] max-h-[500px] overflow-y-auto scrollbar-thin"
                style={{
                  backgroundImage: `radial-gradient(hsl(var(--whatsapp) / 0.06) 1px, transparent 1px)`,
                  backgroundSize: "20px 20px",
                  backgroundColor: "hsl(var(--whatsapp-soft) / 0.3)",
                }}
              >
                {conversa.map((m, i) => (
                  <div
                    key={i}
                    className={`flex ${m.from === "user" ? "justify-end" : "justify-start"} animate-fade-in group`}
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="max-w-[80%] relative">
                      <div
                        className={`relative px-3.5 py-2.5 rounded-2xl shadow-soft ${
                          m.from === "user"
                            ? "bg-success text-success-foreground rounded-tr-sm"
                            : "bg-card text-foreground rounded-tl-sm"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line leading-relaxed">{m.text}</p>
                        <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${m.from === "user" ? "text-success-foreground/70" : "text-muted-foreground"}`}>
                          <span>{m.time}</span>
                          {m.from === "user" && <CheckCheck className="h-3 w-3" />}
                        </div>
                      </div>
                      <div className={`absolute -top-2 ${m.from === "user" ? "-left-9" : "-right-9"} opacity-0 group-hover:opacity-100 transition-smooth`}>
                        <CopyButton text={m.text} size="icon" variant="secondary" className="h-7 w-7 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-card border-t border-border flex items-center gap-2">
                <Input placeholder="Simular mensagem do cliente..." className="rounded-full bg-muted/50 border-0" />
                <Button size="icon" className="rounded-full gradient-primary text-primary-foreground border-0" onClick={() => toast("Simulação enviada!")}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            <Card className="p-5 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquareText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold">Mensagens prontas</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Copie e envie para seus clientes</p>
              <div className="space-y-3">
                {[
                  { label: "Pedido confirmado", text: "Olá! ✨ Seu pedido foi confirmado e entrará em produção. Em breve te aviso quando estiver pronto. Obrigada pela preferência! 🎂" },
                  { label: "Pagamento Pix", text: "💚 Para finalizar, faça o Pix para a chave: maria@docesdamaria.com.br no valor combinado. Me envia o comprovante quando pagar! 🙏" },
                  { label: "Pedido pronto", text: "🎉 Boa notícia! Seu pedido está pronto para retirada/entrega. Posso te enviar agora?" },
                  { label: "Agradecimento", text: "Muito obrigada pela compra! ❤️ Se gostou, deixe sua avaliação e indique para os amigos. Volte sempre! 🍰" },
                ].map((m) => (
                  <div key={m.label} className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-smooth">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-primary">{m.label}</span>
                      <CopyButton text={m.text} size="sm" variant="ghost" className="h-6 w-6" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{m.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comandos" className="mt-0">
          <Card className="p-6 shadow-card">
            <div className="flex items-start gap-3 mb-5 flex-wrap">
              <div className="h-11 w-11 rounded-2xl gradient-success flex items-center justify-center shadow-success shrink-0">
                <MessageCircle className="h-5 w-5 text-success-foreground" />
              </div>
              <div className="flex-1 min-w-[200px]">
                <h2 className="text-base font-bold">Guia rápido de comandos</h2>
                <p className="text-xs text-muted-foreground">Toque no botão para copiar o comando e colar no WhatsApp</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-5">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setFiltro(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-bounce ${
                    filtro === c
                      ? "gradient-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {filtrados.map((c, i) => (
                <div
                  key={c.cmd}
                  className="group flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-glow transition-smooth animate-fade-in"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <code className="px-2 py-1 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold">
                        {c.cmd}
                      </code>
                      <Badge variant="outline" className="text-[10px]">{c.cat}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </div>
                  <CopyButton text={c.cmd} className="opacity-60 group-hover:opacity-100 shrink-0" />
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default WhatsAppPage;
