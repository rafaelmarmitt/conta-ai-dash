import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, MessageCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const fluxoCaixa = [
  { mes: "Jan", entradas: 4200, saidas: 2100 },
  { mes: "Fev", entradas: 3800, saidas: 2400 },
  { mes: "Mar", entradas: 5200, saidas: 2800 },
  { mes: "Abr", entradas: 4900, saidas: 2200 },
  { mes: "Mai", entradas: 6100, saidas: 3100 },
  { mes: "Jun", entradas: 7300, saidas: 3400 },
];

const atividades = [
  { tipo: "entrada", desc: "Venda de Bolo Decorado", cliente: "Maria S.", valor: 180, hora: "Há 5 min" },
  { tipo: "saida", desc: "Compra de Insumos", cliente: "Fornecedor A", valor: 320, hora: "Há 1h" },
  { tipo: "entrada", desc: "Pagamento Doces Festa", cliente: "João P.", valor: 450, hora: "Há 3h" },
  { tipo: "saida", desc: "Conta de Energia", cliente: "Despesa Fixa", valor: 145, hora: "Ontem" },
  { tipo: "entrada", desc: "Encomenda Brigadeiros", cliente: "Ana L.", valor: 90, hora: "Ontem" },
];

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Index = () => {
  return (
    <DashboardLayout title="Olá, Empreendedor! 👋" subtitle="Aqui está o resumo do seu negócio hoje">
      <div className="grid gap-4 md:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Faturamento Mensal" value={formatBRL(7300)} hint="+19,7% vs mês anterior" icon={TrendingUp} tone="success" />
        <StatCard label="Total de Despesas" value={formatBRL(3400)} hint="+9,7% vs mês anterior" icon={TrendingDown} tone="destructive" />
        <StatCard label="Lucro Líquido" value={formatBRL(3900)} hint="Margem de 53%" icon={Wallet} tone="primary" />
        <StatCard label="DAS deste mês" value={formatBRL(75.9)} hint="Vence em 12 dias" icon={AlertCircle} tone="warning" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Fluxo de Caixa</h2>
              <p className="text-xs text-muted-foreground">Entradas vs Saídas — últimos 6 meses</p>
            </div>
            <Badge variant="secondary" className="bg-primary-soft text-primary border-0">
              Semestre
            </Badge>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fluxoCaixa} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="cEntradas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cSaidas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                  }}
                  formatter={(value: number) => formatBRL(value)}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#cEntradas)" />
                <Area type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(var(--success))" strokeWidth={2.5} fill="url(#cSaidas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">Atividades Recentes</h2>
              <p className="text-xs text-muted-foreground">Direto do WhatsApp</p>
            </div>
            <MessageCircle className="h-5 w-5 text-primary" />
          </div>
          <ul className="space-y-3">
            {atividades.map((a, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-smooth">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${a.tipo === "entrada" ? "bg-success-soft text-success-foreground" : "bg-destructive/10 text-destructive"}`}>
                  {a.tipo === "entrada" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.desc}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.cliente} · {a.hora}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${a.tipo === "entrada" ? "text-success-foreground" : "text-destructive"}`}>
                  {a.tipo === "entrada" ? "+" : "-"}{formatBRL(a.valor)}
                </span>
              </li>
            ))}
          </ul>
          <Button variant="ghost" className="w-full mt-3 text-primary">Ver todas</Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Index;
