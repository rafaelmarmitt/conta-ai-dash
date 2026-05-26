import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { CopyButton } from "@/components/CopyButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Activity,
  Bot,
  CheckCheck,
  Clock,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  Save,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type ProfileRow = {
  phone: string | null;
  whatsapp_connected_at: string | null;
  whatsapp_bot_enabled: boolean;
  whatsapp_onboarding_pending: boolean | null;
  whatsapp_onboarding_sent_at: string | null;
};

type WhatsAppMessage = {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string | null;
  status: string | null;
  ai_intent: string | null;
  created_at: string;
};

const comandos = [
  { cmd: "vendi 150 bolo no pix", desc: "Registra uma venda paga via Pix", cat: "Financeiro" },
  { cmd: "gastei 80 com fornecedor", desc: "Registra uma despesa", cat: "Financeiro" },
  { cmd: "agenda corte para sexta 14h", desc: "Cria um atendimento na agenda", cat: "Agenda" },
  { cmd: "produto bolo 180", desc: "Cadastra produto ou servico", cat: "Catalogo" },
  { cmd: "das maio 76,90 vencimento dia 20", desc: "Atualiza o DAS do mes", cat: "Impostos" },
  { cmd: "quanto vendi hoje?", desc: "Consulta dados do dashboard", cat: "Consulta" },
];

const cats = ["Todos", "Financeiro", "Agenda", "Catalogo", "Impostos", "Consulta"];

const workflowUrl = "https://rafamitt.app.n8n.cloud/workflow/7YfGKuZqcJfeySm7";
const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 2) return digits ? `+${digits}` : "";
  if (digits.length <= 4) return `+${digits.slice(0, 2)} ${digits.slice(2)}`;
  if (digits.length <= 9) return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
  return `+${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const normalizeWhatsAppPhone = (value: string) => {
  const digits = onlyDigits(value);
  if (!digits) return "";
  if (digits.startsWith("55")) return digits;
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  return digits;
};

const triggerOnboardingWebhook = async (phoneNumber: string) => {
  if (!phoneNumber) return;

  const { error } = await supabase.functions.invoke("n8n-bridge", {
    body: { action: "trigger_onboarding", phone: phoneNumber, source: "dashboard-whatsapp" },
  });

  if (error) throw error;
};

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

const WhatsAppPage = () => {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState("Todos");
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [phone, setPhone] = useState("");
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [activity, setActivity] = useState<{ h: string; msgs: number }[]>([]);
  const [messagesToday, setMessagesToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const connected = Boolean(profile?.phone);
  const lastMessage = messages[0]?.created_at;
  const filtrados = filtro === "Todos" ? comandos : comandos.filter((command) => command.cat === filtro);
  const tutorialPending = Boolean(profile?.whatsapp_onboarding_pending);

  const statusLabel = useMemo(() => {
    if (!connected) return "Pendente";
    return tutorialPending ? "Tutorial em envio" : "Conectado";
  }, [connected, tutorialPending]);

  const fetchConnection = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("phone, whatsapp_connected_at, whatsapp_bot_enabled, whatsapp_onboarding_pending, whatsapp_onboarding_sent_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      toast.error("Nao foi possivel carregar a conexao do WhatsApp.");
      return;
    }

    const nextProfile = data as ProfileRow | null;
    setProfile(nextProfile);
    setPhone(maskPhone(nextProfile?.phone ?? ""));
  }, [user]);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [{ data: recent }, { count }, { data: chartRows }] = await Promise.all([
      supabase
        .from("whatsapp_messages")
        .select("id, direction, message_type, body, status, ai_intent, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("whatsapp_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", dayStart.toISOString()),
      supabase
        .from("whatsapp_messages")
        .select("created_at")
        .eq("user_id", user.id)
        .gte("created_at", last24h.toISOString()),
    ]);

    setMessages((recent ?? []) as WhatsAppMessage[]);
    setMessagesToday(count ?? 0);

    const buckets = new Map<string, number>();
    for (let index = 23; index >= 0; index -= 1) {
      const hour = new Date(Date.now() - index * 60 * 60 * 1000);
      buckets.set(`${hour.getHours().toString().padStart(2, "0")}h`, 0);
    }

    (chartRows ?? []).forEach((row) => {
      const hour = `${new Date(row.created_at).getHours().toString().padStart(2, "0")}h`;
      buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
    });

    setActivity(Array.from(buckets, ([h, msgs]) => ({ h, msgs })));
  }, [user]);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    await Promise.all([fetchConnection(), fetchMessages()]);
    setLoading(false);
  }, [fetchConnection, fetchMessages, user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!user) return;

    const profileChannel = supabase
      .channel(`profiles-whatsapp-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter: `user_id=eq.${user.id}` },
        () => fetchConnection()
      )
      .subscribe();

    const messagesChannel = supabase
      .channel(`whatsapp-messages-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "whatsapp_messages", filter: `user_id=eq.${user.id}` },
        () => fetchMessages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [fetchConnection, fetchMessages, user]);

  const saveConnection = async () => {
    if (!user) return;
    setSaving(true);

    const normalizedPhone = normalizeWhatsAppPhone(phone);
    const phoneChanged = Boolean(normalizedPhone) && normalizedPhone !== (profile?.phone ?? "");
    const shouldSendOnboarding = Boolean(normalizedPhone) && (phoneChanged || !profile?.whatsapp_onboarding_sent_at);
    const { error } = await supabase
      .from("profiles")
      .update({
        phone: normalizedPhone || null,
        whatsapp_bot_enabled: true,
        whatsapp_connected_at: normalizedPhone && !profile?.whatsapp_connected_at ? new Date().toISOString() : profile?.whatsapp_connected_at ?? null,
        whatsapp_onboarding_pending: shouldSendOnboarding ? true : profile?.whatsapp_onboarding_pending ?? false,
      })
      .eq("user_id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Nao foi possivel salvar a conexao.");
      return;
    }

    if (shouldSendOnboarding) {
      try {
        await triggerOnboardingWebhook(normalizedPhone);
      } catch (webhookError) {
        console.warn("Falha ao disparar onboarding do WhatsApp", webhookError);
        toast.warning("Telefone salvo, mas nao consegui disparar o onboarding automaticamente.");
      }
    }

    toast.success(shouldSendOnboarding ? "Telefone vinculado. O bot vai enviar uma mensagem de boas-vindas." : "Telefone do WhatsApp atualizado.");
    refreshAll();
  };

  return (
    <>
      <Seo
        title="WhatsApp & Conexao · Conta.AI"
        description="Conecte seu WhatsApp ao Conta.AI e acompanhe vendas, despesas, agenda e impostos em tempo real."
        path="/whatsapp"
      />
      <DashboardLayout
        title="WhatsApp & Conexao"
        subtitle="Vincule seu telefone ao bot e acompanhe o processamento em tempo real"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-xl" onClick={refreshAll} disabled={loading}>
              <RefreshCw className="h-4 w-4" /> Atualizar
            </Button>
            <Button variant="success" className="rounded-xl" onClick={saveConnection} disabled={saving}>
              <Save className="h-4 w-4" /> Salvar conexao
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className={`p-5 shadow-card relative overflow-hidden ${connected ? "border-success/30 bg-success-soft/40" : "border-warning/30"}`}>
            <div className="absolute top-3 right-3 flex items-center justify-center h-10 w-10 rounded-full">
              <span className={`relative inline-flex h-3 w-3 rounded-full ${connected ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
            </div>
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status do bot</p>
            <p className="text-2xl font-extrabold mt-1">{statusLabel}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {lastMessage ? `Ultima mensagem: ${formatTime(lastMessage)}` : "Aguardando primeira mensagem"}
            </p>
          </Card>
          <Card className="p-5 shadow-card hover-lift">
            <Activity className="h-5 w-5 text-info mb-2" />
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Mensagens hoje</p>
            <p className="text-2xl font-extrabold mt-1">{messagesToday}</p>
            <p className="text-xs text-muted-foreground mt-1">Entrada e saida pelo WhatsApp</p>
          </Card>
          <Card className="p-5 shadow-card hover-lift">
            <Clock className="h-5 w-5 text-coral mb-2" />
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Workflow n8n</p>
            <p className="text-sm font-bold mt-2 truncate">Conta.AI Z-API WhatsApp Agent</p>
          </Card>
        </div>

        <Tabs defaultValue="conexao" className="w-full">
          <TabsList className="mb-5 bg-card border border-border p-1 rounded-xl">
            <TabsTrigger value="conexao" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Conexao</TabsTrigger>
            <TabsTrigger value="conversa" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Mensagens</TabsTrigger>
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
                    <h2 className="text-base font-bold">Vincular seu WhatsApp</h2>
                    <p className="text-xs text-muted-foreground">Informe o telefone que vai conversar com o bot Conta.AI.</p>
                  </div>
                  <Badge className={connected ? "bg-success-soft text-success-deep border-0" : ""} variant={connected ? "default" : "outline"}>
                    {connected ? "Vinculado" : "Pendente"}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2 max-w-md">
                    <Label htmlFor="phone">Seu WhatsApp</Label>
                    <Input id="phone" value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} placeholder="+55 11 98765-4321" />
                    <p className="text-xs text-muted-foreground">
                      Use o mesmo numero que voce vai usar para falar com o bot.
                    </p>
                  </div>
                  {connected && (
                    <div className="rounded-lg border border-success/30 bg-success-soft/40 px-4 py-3 text-sm text-success-deep">
                      Bot conectado. Ao vincular pela primeira vez, voce recebe uma confirmacao e duas mensagens curtas de tutorial no WhatsApp.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="success" onClick={saveConnection} disabled={saving}>
                    <Save className="h-4 w-4" /> Vincular telefone
                  </Button>
                </div>
              </Card>

              <Card className="p-5 shadow-card">
                <h3 className="text-sm font-bold mb-1">Atividade nas ultimas 24h</h3>
                <p className="text-xs text-muted-foreground mb-4">Atualiza quando o n8n grava no Supabase</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activity} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="h" fontSize={11} stroke="hsl(var(--muted-foreground))" minTickGap={18} />
                      <YAxis fontSize={11} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }} />
                      <Line type="monotone" dataKey="msgs" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
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
                      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-success animate-pulse" : "bg-white/60"}`} />
                      {connected ? "online" : "aguardando conexao"}
                    </p>
                  </div>
                  <Badge className="bg-white/20 text-white border-0 text-[10px]">Realtime</Badge>
                </div>
                <div
                  className="p-5 space-y-3 min-h-[420px] max-h-[500px] overflow-y-auto scrollbar-thin"
                  style={{
                    backgroundImage: `radial-gradient(hsl(var(--whatsapp) / 0.06) 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                    backgroundColor: "hsl(var(--whatsapp-soft) / 0.3)",
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="h-full min-h-[360px] flex items-center justify-center text-center text-sm text-muted-foreground">
                      Nenhuma mensagem processada ainda.
                    </div>
                  ) : (
                    [...messages].reverse().map((message) => (
                      <div key={message.id} className={`flex ${message.direction === "inbound" ? "justify-end" : "justify-start"} animate-fade-in group`}>
                        <div className="max-w-[80%] relative">
                          <div
                            className={`relative px-3.5 py-2.5 rounded-2xl shadow-soft ${
                              message.direction === "inbound"
                                ? "bg-success text-success-foreground rounded-tr-sm"
                                : "bg-card text-foreground rounded-tl-sm"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-line leading-relaxed">{message.body || `[${message.message_type}]`}</p>
                            <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] ${message.direction === "inbound" ? "text-success-foreground/70" : "text-muted-foreground"}`}>
                              <span>{formatTime(message.created_at)}</span>
                              {message.direction === "inbound" && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="p-5 shadow-card">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold">Arquitetura ativa</h3>
                </div>
                <div className="space-y-3 text-xs text-muted-foreground">
                  <p>Webhook Z-API recebe mensagens do WhatsApp conectado.</p>
                  <p>Switch separa texto, audio, imagem e fallback.</p>
                  <p>Gemini 2.5 Flash-Lite transcreve audio e interpreta imagem antes do Agent.</p>
                  <p>Wait + Aggregate juntam mensagens enviadas em sequencia.</p>
                  <p>Supabase grava vendas, despesas, agenda, produtos, DAS e historico.</p>
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
                  <h2 className="text-base font-bold">Comandos de teste</h2>
                  <p className="text-xs text-muted-foreground">Envie frases naturais no WhatsApp; o Agent classifica a intencao.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-5">
                {cats.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFiltro(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-bounce ${
                      filtro === cat ? "gradient-primary text-primary-foreground shadow-soft" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {filtrados.map((command) => (
                  <div key={command.cmd} className="group flex items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-glow transition-smooth">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <code className="px-2 py-1 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold">{command.cmd}</code>
                        <Badge variant="outline" className="text-[10px]">{command.cat}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{command.desc}</p>
                    </div>
                    <CopyButton text={command.cmd} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </DashboardLayout>
    </>
  );
};

export default WhatsAppPage;
