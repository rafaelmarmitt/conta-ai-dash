import { DashboardLayout } from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
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
import { BusinessWidgets } from "@/components/BusinessWidgets";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MockBadge } from "@/components/MockBadge";
import { InfoTooltip } from "@/components/InfoTooltip";
import { EmptyState } from "@/components/EmptyState";
import { DasAlertCard } from "@/components/DasAlertCard";
import { NewSaleDialog } from "@/components/NewSaleDialog";
import mascot from "@/assets/mascot.png";

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

const MES_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const DIA_ABBR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const timeAgo = (iso: string) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `Há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Há ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return "Ontem";
  return `Há ${Math.floor(diff / 86400)} dias`;
};

type Atividade = { tipo: "entrada" | "saida"; desc: string; cliente: string; valor: number; hora: string; emoji: string };
type TopItem = { nome: string; vendas: number; total: number; cor: string };
const BAR_COLORS = ["bg-primary", "bg-success", "bg-coral", "bg-info"];

const Index = () => {
  const { profile, user } = useAuth();
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";
  const firstName = (profile?.full_name || "").split(" ")[0] || "MEI";
  const businessKey = profile?.business_type ?? "outros";
  const config = BUSINESS_CONFIGS[businessKey];
  const mockValues = METRIC_VALUES[businessKey];
  const mockAtividades = ACTIVITIES_BY_TYPE[businessKey];
  const mockTopProdutos = TOP_ITEMS_BY_TYPE[businessKey];

  const [values, setValues] = useState(mockValues);
  const [isMock, setIsMock] = useState(true);
  const [fluxo, setFluxo] = useState(fluxoCaixa);
  const [semanaData, setSemanaData] = useState(semana);
  const [semanaTotal, setSemanaTotal] = useState(4580);
  const [atividades, setAtividades] = useState<Atividade[]>(mockAtividades);
  const [topProdutos, setTopProdutos] = useState<TopItem[]>(mockTopProdutos);
  const [streak, setStreak] = useState(12);
  const [insight, setInsight] = useState<string>("Cadastre vendas pelo WhatsApp para ver insights personalizados aqui.");

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const sixMonthsStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
      const streakStart = new Date(now); streakStart.setDate(now.getDate() - 60); streakStart.setHours(0, 0, 0, 0);

      const [
        { data: salesMonth },
        { data: expensesMonth },
        { count: customersCount },
        { data: sales6m },
        { data: expenses6m },
        { data: salesWeek },
        { data: expensesRecent },
        { data: salesRecent },
        { data: items },
        { data: salesStreak },
      ] = await Promise.all([
        supabase.from("sales").select("total").eq("user_id", user.id).gte("sold_at", monthStart.toISOString()),
        supabase.from("expenses").select("amount").eq("user_id", user.id).gte("expense_date", monthStart.toISOString().slice(0, 10)),
        supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("sales").select("total,sold_at").eq("user_id", user.id).gte("sold_at", sixMonthsStart.toISOString()),
        supabase.from("expenses").select("amount,expense_date").eq("user_id", user.id).gte("expense_date", sixMonthsStart.toISOString().slice(0, 10)),
        supabase.from("sales").select("total,sold_at").eq("user_id", user.id).gte("sold_at", weekStart.toISOString()),
        supabase.from("expenses").select("amount,description,expense_date,category").eq("user_id", user.id).order("expense_date", { ascending: false }).limit(10),
        supabase.from("sales").select("id,total,sold_at,customer_id,customers(name)").eq("user_id", user.id).order("sold_at", { ascending: false }).limit(10),
        supabase.from("sale_items").select("product_name,quantity,subtotal,sales!inner(user_id,sold_at)").eq("sales.user_id", user.id).gte("sales.sold_at", monthStart.toISOString()),
        supabase.from("sales").select("sold_at").eq("user_id", user.id).gte("sold_at", streakStart.toISOString()).order("sold_at", { ascending: false }),
      ]);

      const hasReal = (salesMonth && salesMonth.length > 0) || (expensesMonth && expensesMonth.length > 0) || (customersCount ?? 0) > 0;
      if (!hasReal) {
        setValues(mockValues); setIsMock(true);
        setAtividades(mockAtividades); setTopProdutos(mockTopProdutos);
        setFluxo(fluxoCaixa); setSemanaData(semana); setSemanaTotal(4580);
        setStreak(12);
        return;
      }

      setIsMock(false);

      const fat = (salesMonth || []).reduce((s, v: any) => s + Number(v.total || 0), 0);
      const desp = (expensesMonth || []).reduce((s, v: any) => s + Number(v.amount || 0), 0);
      const ticket = salesMonth && salesMonth.length ? fat / salesMonth.length : 0;
      setValues({
        ...mockValues,
        faturamento: fat,
        despesas: desp,
        lucro: fat - desp,
        clientes: customersCount ?? 0,
        ticket: Math.round(ticket),
      });

      const fluxoMap: Record<string, { entradas: number; saidas: number }> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        fluxoMap[`${d.getFullYear()}-${d.getMonth()}`] = { entradas: 0, saidas: 0 };
      }
      (sales6m || []).forEach((s: any) => {
        const d = new Date(s.sold_at);
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        if (fluxoMap[k]) fluxoMap[k].entradas += Number(s.total || 0);
      });
      (expenses6m || []).forEach((e: any) => {
        const d = new Date(e.expense_date);
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        if (fluxoMap[k]) fluxoMap[k].saidas += Number(e.amount || 0);
      });
      setFluxo(Object.entries(fluxoMap).map(([k, v]) => {
        const [, m] = k.split("-").map(Number);
        return { mes: MES_ABBR[m], entradas: Math.round(v.entradas), saidas: Math.round(v.saidas) };
      }));

      const weekMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now); d.setDate(now.getDate() - i);
        weekMap[d.toDateString()] = 0;
      }
      let weekTotal = 0;
      (salesWeek || []).forEach((s: any) => {
        const k = new Date(s.sold_at).toDateString();
        if (k in weekMap) {
          weekMap[k] += Number(s.total || 0);
          weekTotal += Number(s.total || 0);
        }
      });
      setSemanaData(Object.entries(weekMap).map(([k, v]) => ({ dia: DIA_ABBR[new Date(k).getDay()], vendas: Math.round(v) })));
      setSemanaTotal(Math.round(weekTotal));

      const acts: Atividade[] = [
        ...(salesRecent || []).map((s: any) => ({
          tipo: "entrada" as const,
          desc: "Venda registrada",
          cliente: s.customers?.name || "Cliente",
          valor: Number(s.total || 0),
          hora: timeAgo(s.sold_at),
          emoji: "💰",
          _ts: new Date(s.sold_at).getTime(),
        })),
        ...(expensesRecent || []).map((e: any) => ({
          tipo: "saida" as const,
          desc: e.description || "Despesa",
          cliente: e.category || "Despesa",
          valor: Number(e.amount || 0),
          hora: timeAgo(e.expense_date),
          emoji: "📤",
          _ts: new Date(e.expense_date).getTime(),
        })),
      ].sort((a: any, b: any) => b._ts - a._ts).slice(0, 6);
      setAtividades(acts.length ? acts : mockAtividades);

      const prodMap: Record<string, { vendas: number; total: number }> = {};
      (items || []).forEach((it: any) => {
        const n = it.product_name || "Item";
        if (!prodMap[n]) prodMap[n] = { vendas: 0, total: 0 };
        prodMap[n].vendas += Number(it.quantity || 0);
        prodMap[n].total += Number(it.subtotal || 0);
      });
      const top = Object.entries(prodMap)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 4)
        .map(([nome, v], i) => ({ nome, vendas: v.vendas, total: v.total, cor: BAR_COLORS[i] }));
      setTopProdutos(top.length ? top : mockTopProdutos);

      const days = new Set((salesStreak || []).map((s: any) => new Date(s.sold_at).toDateString()));
      let st = 0;
      const cursor = new Date(now);
      while (days.has(cursor.toDateString())) {
        st++;
        cursor.setDate(cursor.getDate() - 1);
      }
      setStreak(st);

      if (top.length) {
        setInsight(`Seu produto top é "${top[0].nome}" com ${formatBRL(top[0].total)} no mês. Considere destacá-lo ou criar combos.`);
      } else if (fat > desp) {
        setInsight(`Lucro positivo de ${formatBRL(fat - desp)} este mês. Continue assim!`);
      } else if (desp > fat) {
        setInsight(`Atenção: despesas (${formatBRL(desp)}) acima do faturamento. Revise os custos.`);
      }
    };
    load();
  }, [user, businessKey]);

  const metaMensal = profile?.monthly_goal && profile.monthly_goal > 0 ? Number(profile.monthly_goal) : 8000;
  const atualMensal = values.faturamento;
  const pctMeta = Math.min(Math.round((atualMensal / metaMensal) * 100), 100);

  const formatValue = (val: number, fmt?: string, suffix?: string) => {
    if (fmt === "currency") return formatBRL(val);
    if (fmt === "percent") return `${val}%`;
    return `${val.toLocaleString("pt-BR")}${suffix ?? ""}`;
  };

  return (
    <>
      <Seo title="Dashboard · Conta.AI" description="Visão geral do seu MEI: vendas, despesas, fluxo de caixa e impostos em tempo real." path="/dashboard" />
    <DashboardLayout
      title={`${saudacao}, ${firstName}! 👋`}
      subtitle={profile?.business_name ? `${profile.business_name} · ${config.label}` : "Aqui está o resumo do seu negócio em tempo real"}
      actions={
        <>
          <Button variant="outline" className="rounded-xl">
            <Download className="h-4 w-4" /> Exportar
          </Button>
          <NewSaleDialog
            trigger={
              <Button variant="hero" className="rounded-xl">
                <Plus className="h-4 w-4" /> Nova venda
              </Button>
            }
          />
        </>
      }
    >
      {/* Hero de boas-vindas + status */}
      <section
        aria-labelledby="welcome-heading"
        className="mb-6 p-5 sm:p-6 rounded-2xl border border-primary/20 gradient-mesh relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <img src={mascot} alt="" className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 animate-float drop-shadow-md" />
          <div className="min-w-0 flex-1">
            <h2 id="welcome-heading" className="text-base sm:text-lg font-extrabold text-foreground">
              Bem-vindo ao Conta.AI.
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Seu negócio gerido pelo WhatsApp, visualizado aqui.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <MockBadge show={isMock} />
              {!isMock && (
                <Badge className="bg-success-soft text-success-deep border-0 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse mr-1.5" />
                  dados em tempo real
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Alerta DAS MEI do mês corrente */}
      <DasAlertCard />

      {/* KPIs adaptativos */}
      <section aria-label="Indicadores principais" className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 mb-6">
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
      </section>

      {/* Widgets específicos do tipo de negócio */}
      <BusinessWidgets type={businessKey} />

      {/* Meta + Streak */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">
        <Card className="p-6 shadow-card lg:col-span-2 relative overflow-hidden border-primary/20 gradient-mesh">
          <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Target className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">Meta de {MES_ABBR[new Date().getMonth()]}</p>
                  <InfoTooltip
                    label="Meta mensal"
                    content="Sua meta de faturamento bruto do mês. Ajuste em Perfil → Meta mensal."
                  />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground break-words">
                  {formatBRL(atualMensal)}
                  <span className="block sm:inline text-base sm:text-lg font-medium text-muted-foreground sm:ml-1">
                    / {formatBRL(metaMensal)}
                  </span>
                </p>
              </div>
              <Badge className="gradient-success text-success-foreground border-0 font-bold shadow-success shrink-0">
                {pctMeta}% 🚀
              </Badge>
            </div>
            <Progress value={pctMeta} className="h-3 mb-3" />
            <p className="text-sm text-muted-foreground">
              Faltam <span className="font-bold text-foreground">{formatBRL(metaMensal - atualMensal)}</span> para bater a meta — você está num ritmo ótimo!
            </p>
          </div>
        </Card>

        <Card className="p-6 shadow-card relative overflow-hidden gradient-coral text-foreground border-0">
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl animate-blob" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-5 w-5" />
              <p className="text-xs font-bold uppercase tracking-wider">Sequência atual</p>
            </div>
            <p className="text-4xl font-extrabold">{streak} {streak === 1 ? "dia" : "dias"} 🔥</p>
            <p className="text-sm text-foreground/85 mt-1 mb-4">registrando vendas no bot</p>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i < Math.min(streak, 7) ? "bg-foreground" : "bg-foreground/30"}`} />
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
              <AreaChart data={fluxo} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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
          <p className="text-xs text-muted-foreground mb-4">Total: <span className="font-bold text-foreground">{formatBRL(semanaTotal)}</span></p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semanaData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
                <span className="font-bold">Dica IA:</span> {insight}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
    </>
  );
};

export default Index;
