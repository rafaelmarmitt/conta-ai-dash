import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp, TrendingDown, Wallet, AlertCircle, MessageCircle,
  ArrowUpRight, ArrowDownRight, Plus, Download, Sparkles,
  Trophy, Target, Zap, Calendar
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend
} from "recharts";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESS_CONFIGS } from "@/lib/businessTypes";

const fluxoCaixa = [
  { mes: "Jan", entradas: 4200, saidas: 2100 },
  { mes: "Fev", entradas: 3800, saidas: 2400 },
  { mes: "Mar", entradas: 5200, saidas: 2800 },
  { mes: "Abr", entradas: 4900, saidas: 2200 },
  { mes: "Mai", entradas: 6100, saidas: 3100 },
  { mes: "Jun", entradas: 7300, saidas: 3400 },
];

const semana = [
  { dia: "Seg", vendas: 320 },
  { dia: "Ter", vendas: 480 },
  { dia: "Qua", vendas: 290 },
  { dia: "Qui", vendas: 620 },
  { dia: "Sex", vendas: 890 },
  { dia: "Sáb", vendas: 1240 },
  { dia: "Dom", vendas: 740 },
];

const METRIC_VALUES: Record<string, Record<string, number>> = {
  comercio:    { faturamento: 7300, ticket: 145, estoque: 240, clientes: 86, despesas: 3400, lucro: 3900, horas: 0, agenda: 0, pedidos: 0 },
  servicos:    { faturamento: 6800, ticket: 0,   estoque: 0,   clientes: 24, despesas: 1200, lucro: 5600, horas: 68, agenda: 32, pedidos: 0 },
  alimentacao: { faturamento: 7300, ticket: 58,  estoque: 0,   clientes: 142, despesas: 3400, lucro: 3900, horas: 0, agenda: 0, pedidos: 126 },
  beleza:      { faturamento: 5400, ticket: 95,  estoque: 0,   clientes: 78, despesas: 1100, lucro: 4300, horas: 0, agenda: 56, pedidos: 0 },
  outros:      { faturamento: 7300, ticket: 0,   estoque: 0,   clientes: 50, despesas: 3400, lucro: 3900, horas: 0, agenda: 0, pedidos: 0 },
};

const ACTIVITIES_BY_TYPE: Record<string, Array<{ tipo: "entrada" | "saida"; desc: string; cliente: string; valor: number; hora: string; emoji: string }>> = {
  comercio: [
    { tipo: "entrada", desc: "Venda de Tênis Esportivo", cliente: "Maria S.", valor: 280, hora: "Há 5 min", emoji: "👟" },
    { tipo: "saida", desc: "Compra de Mercadoria", cliente: "Fornecedor A", valor: 1200, hora: "Há 1h", emoji: "📦" },
    { tipo: "entrada", desc: "Venda Camiseta + Boné", cliente: "João P.", valor: 145, hora: "Há 3h", emoji: "👕" },
    { tipo: "saida", desc: "Conta de Energia", cliente: "Despesa Fixa", valor: 145, hora: "Ontem", emoji: "⚡" },
    { tipo: "entrada", desc: "Pix recebido", cliente: "Ana L.", valor: 90, hora: "Ontem", emoji: "💳" },
  ],
  servicos: [
    { tipo: "entrada", desc: "Consultoria 2h", cliente: "Empresa X", valor: 600, hora: "Há 30 min", emoji: "💼" },
    { tipo: "saida", desc: "Assinatura Notion", cliente: "Despesa Fixa", valor: 49, hora: "Há 2h", emoji: "📝" },
    { tipo: "entrada", desc: "Mentoria mensal", cliente: "João P.", valor: 800, hora: "Hoje", emoji: "🎯" },
    { tipo: "entrada", desc: "Projeto site", cliente: "Café Sul", valor: 1500, hora: "Ontem", emoji: "💻" },
    { tipo: "saida", desc: "Internet escritório", cliente: "Vivo", valor: 120, hora: "Ontem", emoji: "📡" },
  ],
  alimentacao: [
    { tipo: "entrada", desc: "Venda de Bolo Decorado", cliente: "Maria S.", valor: 180, hora: "Há 5 min", emoji: "🎂" },
    { tipo: "saida", desc: "Compra de Insumos", cliente: "Fornecedor A", valor: 320, hora: "Há 1h", emoji: "🛒" },
    { tipo: "entrada", desc: "Pagamento Doces Festa", cliente: "João P.", valor: 450, hora: "Há 3h", emoji: "🍰" },
    { tipo: "saida", desc: "Conta de Energia", cliente: "Despesa Fixa", valor: 145, hora: "Ontem", emoji: "⚡" },
    { tipo: "entrada", desc: "Encomenda Brigadeiros", cliente: "Ana L.", valor: 90, hora: "Ontem", emoji: "🍫" },
  ],
  beleza: [
    { tipo: "entrada", desc: "Manicure + Pedicure", cliente: "Beatriz S.", valor: 80, hora: "Há 10 min", emoji: "💅" },
    { tipo: "entrada", desc: "Corte + Escova", cliente: "Carla M.", valor: 110, hora: "Há 2h", emoji: "💇‍♀️" },
    { tipo: "saida", desc: "Esmaltes + acetona", cliente: "Beauty Shop", valor: 230, hora: "Hoje", emoji: "💄" },
    { tipo: "entrada", desc: "Pacote Spa dos Pés", cliente: "Diana L.", valor: 180, hora: "Ontem", emoji: "✨" },
    { tipo: "saida", desc: "Aluguel sala", cliente: "Despesa Fixa", valor: 800, hora: "Ontem", emoji: "🏠" },
  ],
  outros: [
    { tipo: "entrada", desc: "Venda registrada", cliente: "Cliente A", valor: 250, hora: "Há 5 min", emoji: "💰" },
    { tipo: "saida", desc: "Despesa operacional", cliente: "Fornecedor", valor: 120, hora: "Há 1h", emoji: "📤" },
    { tipo: "entrada", desc: "Recebimento", cliente: "Cliente B", valor: 480, hora: "Hoje", emoji: "✨" },
    { tipo: "saida", desc: "Conta mensal", cliente: "Despesa Fixa", valor: 145, hora: "Ontem", emoji: "📋" },
    { tipo: "entrada", desc: "Pix recebido", cliente: "Cliente C", valor: 90, hora: "Ontem", emoji: "💳" },
  ],
};

const TOP_ITEMS_BY_TYPE: Record<string, Array<{ nome: string; vendas: number; total: number; cor: string }>> = {
  comercio: [
    { nome: "Tênis esportivo", vendas: 18, total: 5040, cor: "bg-primary" },
    { nome: "Camiseta básica", vendas: 32, total: 1920, cor: "bg-success" },
    { nome: "Mochila", vendas: 9, total: 2700, cor: "bg-coral" },
    { nome: "Boné", vendas: 14, total: 700, cor: "bg-info" },
  ],
  servicos: [
    { nome: "Consultoria mensal", vendas: 8, total: 6400, cor: "bg-primary" },
    { nome: "Mentoria 1:1", vendas: 12, total: 3600, cor: "bg-success" },
    { nome: "Projeto site", vendas: 2, total: 3000, cor: "bg-coral" },
    { nome: "Workshop", vendas: 4, total: 1200, cor: "bg-info" },
  ],
  alimentacao: [
    { nome: "Bolo Decorado", vendas: 28, total: 5040, cor: "bg-primary" },
    { nome: "Brigadeiros (cento)", vendas: 19, total: 1710, cor: "bg-success" },
    { nome: "Kit Festa", vendas: 6, total: 2700, cor: "bg-coral" },
    { nome: "Doce de Leite", vendas: 12, total: 720, cor: "bg-info" },
  ],
  beleza: [
    { nome: "Pacote Spa dos Pés", vendas: 14, total: 2520, cor: "bg-primary" },
    { nome: "Corte + Escova", vendas: 22, total: 2420, cor: "bg-success" },
    { nome: "Coloração completa", vendas: 8, total: 1760, cor: "bg-coral" },
    { nome: "Design sobrancelha", vendas: 30, total: 1500, cor: "bg-info" },
  ],
  outros: [
    { nome: "Item A", vendas: 18, total: 3600, cor: "bg-primary" },
    { nome: "Item B", vendas: 22, total: 2200, cor: "bg-success" },
    { nome: "Item C", vendas: 8, total: 1600, cor: "bg-coral" },
    { nome: "Item D", vendas: 14, total: 980, cor: "bg-info" },
  ],
};

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Index = () => {
  const { profile } = useAuth();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const firstName = (profile?.full_name || "").split(" ")[0] || "MEI";
  const businessKey = profile?.business_type ?? "outros";
  const config = BUSINESS_CONFIGS[businessKey];
  const values = METRIC_VALUES[businessKey];
  const atividades = ACTIVITIES_BY_TYPE[businessKey];
  const topProdutos = TOP_ITEMS_BY_TYPE[businessKey];

  const metaMensal = profile?.monthly_goal && profile.monthly_goal > 0 ? Number(profile.monthly_goal) : 8000;
  const atualMensal = values.faturamento;
  const pctMeta = Math.min(Math.round((atualMensal / metaMensal) * 100), 100);

  const formatValue = (val: number, fmt?: string, suffix?: string) => {
    if (fmt === "currency") return formatBRL(val);
    if (fmt === "percent") return `${val}%`;
    return `${val.toLocaleString("pt-BR")}${suffix ?? ""}`;
  };

  return (
    <DashboardLayout
      title={`${saudacao}, ${firstName}! 👋`}
      subtitle={profile?.business_name ? `${profile.business_name} · ${config.label}` : "Aqui está o resumo do seu negócio em tempo real"}
      actions={
        <>
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4" /> Exportar
          </Button>
          <Button variant="hero" className="rounded-xl">
            <Plus className="h-4 w-4" /> Nova venda
          </Button>
        </>
      }
    >
      {/* KPIs adaptativos */}
      <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {config.metrics.map((m, idx) => {
          const tones: Array<"primary" | "success" | "destructive" | "warning"> = ["primary", "success", "destructive", "warning"];
          const tone = tones[idx % 4];
          return (
            <StatCard
              key={m.key}
              label={m.label}
              value={formatValue(values[m.key] ?? 0, m.format, m.suffix)}
              trend={idx === 0 ? 19.7 : idx === 1 ? 12.3 : undefined}
              hint={idx === 0 ? "vs mês anterior" : idx === 3 ? "ativos no mês" : "este mês"}
              icon={m.icon}
              tone={tone}
              accent={idx === 0}
            />
          );
        })}
      </div>

      {/* Meta + Streak */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">
        <Card className="p-6 shadow-card lg:col-span-2 relative overflow-hidden border-primary/20 gradient-mesh">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Meta de Junho</p>
                </div>
                <p className="text-3xl md:text-4xl font-extrabold text-foreground">
                  {formatBRL(atualMensal)} <span className="text-lg font-medium text-muted-foreground">/ {formatBRL(metaMensal)}</span>
                </p>
              </div>
              <Badge className="gradient-success text-success-foreground border-0 font-bold shadow-success">
                {pctMeta}% 🚀
              </Badge>
            </div>
            <Progress value={pctMeta} className="h-3 mb-3" />
            <p className="text-sm text-muted-foreground">
              Faltam <span className="font-bold text-foreground">{formatBRL(metaMensal - atualMensal)}</span> para bater a meta — você está num ritmo ótimo!
            </p>
          </div>
        </Card>

        <Card className="p-6 shadow-card relative overflow-hidden gradient-coral text-primary-foreground border-0">
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-wider">Sequência atual</p>
            </div>
            <p className="text-4xl font-extrabold">12 dias 🔥</p>
            <p className="text-sm text-primary-foreground/85 mt-1 mb-4">registrando vendas no bot</p>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">
        <Card className="p-5 lg:col-span-2 shadow-card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-foreground">Fluxo de Caixa</h2>
              <p className="text-xs text-muted-foreground">Entradas vs Saídas — últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary-soft text-primary border-0">Semestre</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">Ano</Badge>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoCaixa} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--coral))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--coral))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    boxShadow: "var(--shadow-card)",
                  }}
                  formatter={(value: number) => formatBRL(value)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#cEntradas)" />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(var(--coral))" strokeWidth={3} fill="url(#cSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="h-4 w-4 text-info" />
            <h2 className="text-base font-bold text-foreground">Vendas da semana</h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Total: <span className="font-bold text-foreground">{formatBRL(4580)}</span></p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semana} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="cBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dia" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => `${v}`} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px" }}
                  formatter={(v: number) => formatBRL(v)}
                />
                <Bar dataKey="vendas" fill="url(#cBar)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Atividades + Top produtos */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-whatsapp-soft flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-whatsapp" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Atividades Recentes</h2>
                <p className="text-xs text-muted-foreground">Direto do seu WhatsApp</p>
              </div>
            </div>
            <Badge className="bg-success-soft text-success-deep border-0">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse mr-1.5" />
              ao vivo
            </Badge>
          </div>
          <ul className="space-y-2">
            {atividades.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth animate-fade-in cursor-pointer group"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-2xl shrink-0">{a.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-smooth">{a.desc}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.cliente} · {a.hora}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${a.tipo === "entrada" ? "text-success-deep" : "text-destructive"}`}>
                  {a.tipo === "entrada" ? "+" : "-"}{formatBRL(a.valor)}
                </span>
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${a.tipo === "entrada" ? "bg-success-soft text-success-deep" : "bg-destructive-soft text-destructive"}`}>
                  {a.tipo === "entrada" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                </div>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="w-full mt-3 text-primary hover:bg-primary-soft" asChild>
            <Link to="/relatorios">Ver todas as transações →</Link>
          </Button>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-warning" />
            <h2 className="text-base font-bold text-foreground">Top Produtos</h2>
          </div>
          <ul className="space-y-4">
            {topProdutos.map((p, i) => {
              const max = Math.max(...topProdutos.map((x) => x.total));
              const pct = (p.total / max) * 100;
              return (
                <li key={i} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-foreground truncate">{p.nome}</span>
                    <span className="font-bold text-primary shrink-0">{formatBRL(p.total)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${p.cor} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{p.vendas} vendas no mês</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 p-3 rounded-xl bg-info-soft border border-info/20">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-info mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">
                <span className="font-bold">Dica IA:</span> seus brigadeiros vendem mais aos finais de semana. Que tal criar um combo?
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
