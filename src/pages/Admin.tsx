import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Eye,
  Send,
  AlertTriangle,
  Search,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Seo } from "@/components/Seo";

type Metrics = {
  active_users_7d: number;
  total_messages: number;
  gmv_total: number;
  gmv_30d: number;
  total_users: number;
  onboarding_rate: number;
  business_types: { type: string; count: number }[];
  top_products: { name: string; qty: number; revenue: number }[];
  hourly_activity: { hour: number; count: number }[];
};

type ProfileRow = {
  user_id: string;
  full_name: string | null;
  business_name: string | null;
  cnpj: string | null;
  phone: string | null;
  business_type: string | null;
  created_at: string;
};

type ErrorLog = {
  id: string;
  source: string;
  severity: string;
  message: string;
  context: Record<string, unknown>;
  created_at: string;
};

type Broadcast = {
  id: string;
  title: string;
  message: string;
  recipients_count: number;
  status: string;
  created_at: string;
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--success))",
  "hsl(var(--info))",
  "hsl(var(--warning))",
  "hsl(var(--coral))",
  "hsl(var(--destructive))",
];

const BRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default function Admin() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [salesByUser, setSalesByUser] = useState<Record<string, { last: string | null; total: number }>>({});
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [search, setSearch] = useState("");
  const [dossier, setDossier] = useState<ProfileRow | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [errSource, setErrSource] = useState<string>("all");

  const loadMetrics = async () => {
    const { data, error } = await supabase.rpc("admin_metrics");
    if (!error && data) setMetrics(data as unknown as Metrics);
  };

  const loadProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, business_name, cnpj, phone, business_type, created_at")
      .order("created_at", { ascending: false });
    setProfiles((data || []) as ProfileRow[]);

    const { data: sales } = await supabase
      .from("sales")
      .select("user_id, total, sold_at")
      .order("sold_at", { ascending: false });
    const map: Record<string, { last: string | null; total: number }> = {};
    (sales || []).forEach((s: any) => {
      const cur = map[s.user_id] || { last: null, total: 0 };
      if (!cur.last || s.sold_at > cur.last) cur.last = s.sold_at;
      cur.total += Number(s.total) || 0;
      map[s.user_id] = cur;
    });
    setSalesByUser(map);
  };

  const loadErrors = async () => {
    const { data } = await supabase
      .from("error_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setErrors((data || []) as ErrorLog[]);
  };

  const loadBroadcasts = async () => {
    const { data } = await supabase
      .from("broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    setBroadcasts((data || []) as Broadcast[]);
  };

  useEffect(() => {
    loadMetrics();
    loadProfiles();
    loadErrors();
    loadBroadcasts();
  }, []);

  // Realtime: refresh metrics on new sales
  useEffect(() => {
    const ch = supabase
      .channel("admin-sales-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => loadMetrics())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "error_logs" }, () => loadErrors())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, []);

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        (p.full_name || "").toLowerCase().includes(q) ||
        (p.business_name || "").toLowerCase().includes(q) ||
        (p.cnpj || "").includes(q),
    );
  }, [profiles, search]);

  const engagement = (userId: string, createdAt: string) => {
    const s = salesByUser[userId];
    const daysSinceJoin = (Date.now() - new Date(createdAt).getTime()) / 86400000;
    if (s?.last) {
      const days = (Date.now() - new Date(s.last).getTime()) / 86400000;
      if (days <= 2) return { label: "Frequente", tone: "bg-success text-success-foreground" };
      if (days > 5) return { label: "Em Risco", tone: "bg-destructive text-destructive-foreground" };
    }
    if (daysSinceJoin < 14) return { label: "Iniciante", tone: "bg-info text-info-foreground" };
    return { label: "Em Risco", tone: "bg-destructive text-destructive-foreground" };
  };

  const filteredErrors = useMemo(
    () => (errSource === "all" ? errors : errors.filter((e) => e.source === errSource)),
    [errors, errSource],
  );

  const sendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Preencha título e mensagem");
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-broadcast", {
        body: { title: broadcastTitle, message: broadcastMessage },
      });
      if (error) throw error;
      toast.success(`Broadcast disparado para ${data?.recipients ?? 0} destinatários`);
      setBroadcastTitle("");
      setBroadcastMessage("");
      loadBroadcasts();
    } catch (e: any) {
      toast.error("Falha ao enviar: " + (e.message || e));
    } finally {
      setSending(false);
    }
  };

  const impersonate = (userId: string) => {
    localStorage.setItem("adminImpersonate", userId);
    window.location.href = "/dashboard";
  };

  const recipientsAvailable = profiles.filter((p) => p.phone && p.phone.length > 5).length;

  return (
    <DashboardLayout title="Admin" subtitle="Saúde e crescimento do Conta.AI">
      <Seo title="Admin — Conta.AI" description="Painel interno" path="/admin" />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="niches">Nichos</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
          <TabsTrigger value="errors">Erros</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Usuários ativos 7d"
              value={String(metrics?.active_users_7d ?? "—")}
              hint={`${metrics?.total_users ?? 0} no total`}
              icon={Users}
              tone="primary"
            />
            <StatCard
              label="Mensagens"
              value={String(metrics?.total_messages ?? "—")}
              hint="WhatsApp processadas"
              icon={MessageSquare}
              tone="info"
            />
            <StatCard
              label="GMV total"
              value={metrics ? BRL(metrics.gmv_total) : "—"}
              hint={metrics ? `${BRL(metrics.gmv_30d)} nos últimos 30d` : ""}
              icon={DollarSign}
              tone="success"
              accent
            />
            <StatCard
              label="Taxa onboarding"
              value={metrics ? `${metrics.onboarding_rate}%` : "—"}
              hint="Concluíram o cadastro"
              icon={TrendingUp}
              tone="coral"
            />
          </div>
        </TabsContent>

        {/* Niches */}
        <TabsContent value="niches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação por tipo de negócio</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics?.business_types ?? []}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {(metrics?.business_types ?? []).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 produtos vendidos</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics?.top_products ?? []} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="qty" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade por hora (30 dias)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics?.hourly_activity ?? []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou CNPJ..."
                className="pl-9"
              />
            </div>
            <Badge variant="secondary">{filteredProfiles.length} usuários</Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Engajamento</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProfiles.map((p) => {
                    const eng = engagement(p.user_id, p.created_at);
                    return (
                      <TableRow key={p.user_id}>
                        <TableCell>
                          <div className="font-medium">{p.business_name || p.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{p.cnpj || "Sem CNPJ"}</div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{p.phone || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.business_type || "—"}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {new Date(p.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge className={eng.tone}>{eng.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button size="sm" variant="outline" onClick={() => setDossier(p)}>
                            <Eye className="h-3.5 w-3.5" /> Dossiê
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => impersonate(p.user_id)}
                            disabled={p.user_id === user?.id}
                          >
                            Simular
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredProfiles.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum usuário encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Broadcast */}
        <TabsContent value="broadcast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagem em massa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Send className="h-4 w-4" />
                {recipientsAvailable} destinatários com telefone cadastrado
              </div>
              <Input
                placeholder="Título interno"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
              />
              <Textarea
                rows={6}
                placeholder="Mensagem que será enviada via WhatsApp..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
              />
              <div className="flex justify-end">
                <Button variant="success" onClick={sendBroadcast} disabled={sending}>
                  <Send className="h-4 w-4" />
                  {sending ? "Enviando..." : `Enviar para ${recipientsAvailable}`}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Destinatários</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {broadcasts.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="text-xs">
                        {new Date(b.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell className="font-medium">{b.title}</TableCell>
                      <TableCell>{b.recipients_count}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            b.status === "sent"
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }
                        >
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!broadcasts.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        Nenhum broadcast enviado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors */}
        <TabsContent value="errors" className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={errSource} onValueChange={setErrSource}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as origens</SelectItem>
                <SelectItem value="gemini">Gemini</SelectItem>
                <SelectItem value="database">Banco de dados</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="edge_function">Edge Function</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredErrors.length} registros</Badge>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quando</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(e.created_at).toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{e.source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            e.severity === "error"
                              ? "bg-destructive text-destructive-foreground"
                              : "bg-warning text-warning-foreground"
                          }
                        >
                          {e.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xl truncate">{e.message}</TableCell>
                    </TableRow>
                  ))}
                  {!filteredErrors.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        <AlertTriangle className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        Nenhum erro registrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dossier */}
      <Dialog open={!!dossier} onOpenChange={(o) => !o && setDossier(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dossiê — {dossier?.business_name || dossier?.full_name}</DialogTitle>
          </DialogHeader>
          {dossier && <DossierContent userId={dossier.user_id} />}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function DossierContent({ userId }: { userId: string }) {
  const [sales, setSales] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [s, e] = await Promise.all([
        supabase
          .from("sales")
          .select("id, total, status, sold_at")
          .eq("user_id", userId)
          .order("sold_at", { ascending: false })
          .limit(20),
        supabase
          .from("expenses")
          .select("id, amount, description, expense_date")
          .eq("user_id", userId)
          .order("expense_date", { ascending: false })
          .limit(20),
      ]);
      setSales(s.data || []);
      setExpenses(e.data || []);
    })();
  }, [userId]);

  const totalSales = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
  const totalExp = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Vendas (últimas 20)</p>
            <p className="text-xl font-bold text-success">{BRL(totalSales)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Despesas (últimas 20)</p>
            <p className="text-xl font-bold text-destructive">{BRL(totalExp)}</p>
          </CardContent>
        </Card>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Vendas recentes</h4>
        <div className="max-h-48 overflow-auto border rounded-lg">
          <Table>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="text-xs">{new Date(s.sold_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{BRL(Number(s.total))}</TableCell>
                </TableRow>
              ))}
              {!sales.length && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground py-4">Sem vendas</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Despesas recentes</h4>
        <div className="max-h-48 overflow-auto border rounded-lg">
          <Table>
            <TableBody>
              {expenses.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="text-xs">{new Date(e.expense_date).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{e.description}</TableCell>
                  <TableCell className="text-right font-medium">{BRL(Number(e.amount))}</TableCell>
                </TableRow>
              ))}
              {!expenses.length && (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground py-4">Sem despesas</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
