import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, AlertTriangle, ChefHat, Package,
  Heart, Star, MapPin, Phone, CheckCircle2, Timer,
  Truck, ShoppingBag, Scissors, Sparkles, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import type { BusinessType } from "@/lib/businessTypes";

const formatBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- COMÉRCIO ---------- */
function ComercioWidgets() {
  const lowStock = [
    { nome: "Tênis Esportivo Preto 42", restante: 2, min: 10, cor: "destructive" },
    { nome: "Camiseta Básica Branca G", restante: 5, min: 15, cor: "warning" },
    { nome: "Boné Trucker Azul", restante: 3, min: 12, cor: "destructive" },
  ];
  const pedidos = [
    { id: "#1284", cliente: "Maria S.", status: "Aguardando envio", valor: 280, eta: "Hoje" },
    { id: "#1283", cliente: "João P.", status: "Em rota", valor: 145, eta: "Amanhã" },
    { id: "#1282", cliente: "Ana L.", status: "Entregue", valor: 90, eta: "Ontem" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2 mb-6">
      <Card className="p-5 shadow-card border-destructive/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive-soft flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Estoque Crítico</h2>
              <p className="text-xs text-muted-foreground">Reposição urgente</p>
            </div>
          </div>
          <Badge className="bg-destructive-soft text-destructive border-0">{lowStock.length} alertas</Badge>
        </div>
        <ul className="space-y-3">
          {lowStock.map((p, i) => {
            const pct = (p.restante / p.min) * 100;
            return (
              <li key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground truncate">{p.nome}</span>
                  <span className={`text-xs font-bold ${p.cor === "destructive" ? "text-destructive" : "text-warning"}`}>
                    {p.restante}/{p.min}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
              </li>
            );
          })}
        </ul>
        <Button variant="outline" className="w-full mt-4 rounded-xl" asChild>
          <Link to="/estoque"><Package className="h-4 w-4" /> Gerenciar estoque</Link>
        </Button>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary-soft flex items-center justify-center">
            <Truck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Últimos Pedidos</h2>
            <p className="text-xs text-muted-foreground">Status de entrega</p>
          </div>
        </div>
        <ul className="space-y-2">
          {pedidos.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth">
              <div className="h-9 w-9 rounded-lg bg-primary-soft flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {p.id.slice(1, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.cliente} · {p.id}</p>
                <p className="text-xs text-muted-foreground">{p.status} · {p.eta}</p>
              </div>
              <span className="text-sm font-bold text-success-deep">{formatBRL(p.valor)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- SERVIÇOS ---------- */
function ServicosWidgets() {
  const agenda = [
    { hora: "09:00", cliente: "Empresa X", servico: "Consultoria estratégica", duracao: "2h", status: "confirmado" },
    { hora: "11:30", cliente: "João P.", servico: "Mentoria 1:1", duracao: "1h", status: "confirmado" },
    { hora: "14:00", cliente: "Café Sul", servico: "Reunião de projeto", duracao: "1h30", status: "pendente" },
    { hora: "16:00", cliente: "Ana L.", servico: "Onboarding", duracao: "45min", status: "confirmado" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2 mb-6">
      <Card className="p-5 shadow-card lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info-soft flex items-center justify-center">
              <Calendar className="h-5 w-5 text-info" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Agenda de Hoje</h2>
              <p className="text-xs text-muted-foreground">{agenda.length} atendimentos · 5h30 faturáveis</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link to="/agenda">Ver agenda</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {agenda.map((a, i) => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-smooth">
              <div className="text-center shrink-0">
                <p className="text-lg font-extrabold text-primary leading-none">{a.hora}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.duracao}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.servico}</p>
                <p className="text-xs text-muted-foreground truncate">{a.cliente}</p>
              </div>
              <Badge className={a.status === "confirmado" ? "bg-success-soft text-success-deep border-0" : "bg-warning-soft text-warning border-0"}>
                {a.status === "confirmado" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Timer className="h-3 w-3 mr-1" />}
                {a.status}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- ALIMENTAÇÃO ---------- */
function AlimentacaoWidgets() {
  const pedidosHoje = [
    { id: "#42", cliente: "Maria S.", item: "Bolo decorado tema unicórnio", entrega: "14:00", status: "preparando" },
    { id: "#41", cliente: "João P.", item: "100 brigadeiros gourmet", entrega: "16:30", status: "pronto" },
    { id: "#40", cliente: "Ana L.", item: "Kit festa 30 pessoas", entrega: "18:00", status: "preparando" },
  ];
  const insumos = [
    { nome: "Chocolate em pó", restante: 15, total: 100 },
    { nome: "Leite condensado", restante: 8, total: 50 },
    { nome: "Manteiga", restante: 30, total: 80 },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2 mb-6">
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-coral-soft flex items-center justify-center">
              <ChefHat className="h-5 w-5 text-coral" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Pedidos do Dia</h2>
              <p className="text-xs text-muted-foreground">{pedidosHoje.length} encomendas · próxima 14:00</p>
            </div>
          </div>
        </div>
        <ul className="space-y-2">
          {pedidosHoje.map((p) => (
            <li key={p.id} className="p-3 rounded-xl border border-border hover:border-coral/40 transition-smooth">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-coral">{p.id} · {p.cliente}</span>
                <Badge className={p.status === "pronto" ? "bg-success-soft text-success-deep border-0" : "bg-warning-soft text-warning border-0"}>
                  {p.status}
                </Badge>
              </div>
              <p className="text-sm font-semibold text-foreground">{p.item}</p>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Entrega {p.entrega}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-warning-soft flex items-center justify-center">
            <Package className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Insumos da Cozinha</h2>
            <p className="text-xs text-muted-foreground">Controle de matéria-prima</p>
          </div>
        </div>
        <ul className="space-y-3">
          {insumos.map((ins, i) => {
            const pct = (ins.restante / ins.total) * 100;
            const cor = pct < 20 ? "text-destructive" : pct < 50 ? "text-warning" : "text-success-deep";
            return (
              <li key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">{ins.nome}</span>
                  <span className={`text-xs font-bold ${cor}`}>{ins.restante} / {ins.total}</span>
                </div>
                <Progress value={pct} className="h-2" />
              </li>
            );
          })}
        </ul>
        <Button variant="outline" className="w-full mt-4 rounded-xl" asChild>
          <Link to="/estoque"><ShoppingBag className="h-4 w-4" /> Lista de compras</Link>
        </Button>
      </Card>
    </div>
  );
}

/* ---------- BELEZA ---------- */
function BelezaWidgets() {
  const agenda = [
    { hora: "09:00", cliente: "Beatriz S.", servico: "Manicure + Pedicure", duracao: "1h30", profissional: "Carla" },
    { hora: "11:00", cliente: "Carla M.", servico: "Corte + Escova", duracao: "1h", profissional: "Júlia" },
    { hora: "13:30", cliente: "Diana L.", servico: "Coloração completa", duracao: "2h30", profissional: "Carla" },
    { hora: "16:30", cliente: "Sara F.", servico: "Design + Henna", duracao: "45min", profissional: "Júlia" },
  ];
  const fidelidade = [
    { nome: "Beatriz S.", visitas: 12, ultimo: "3 dias", proxBeneficio: "Spa grátis em 2 visitas" },
    { nome: "Carla M.", visitas: 8, ultimo: "1 semana", proxBeneficio: "Desconto 20% em 3 visitas" },
    { nome: "Diana L.", visitas: 15, ultimo: "2 dias", proxBeneficio: "Próxima é cortesia! 🎉" },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-2 mb-6">
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success-soft flex items-center justify-center">
              <Scissors className="h-5 w-5 text-success-deep" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Agenda do Salão</h2>
              <p className="text-xs text-muted-foreground">Hoje · {agenda.length} atendimentos</p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" asChild>
            <Link to="/agenda">Ver tudo</Link>
          </Button>
        </div>
        <ul className="space-y-2">
          {agenda.map((a, i) => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-success/40 transition-smooth">
              <div className="text-center shrink-0">
                <p className="text-base font-extrabold text-success-deep leading-none">{a.hora}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.duracao}</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{a.servico}</p>
                <p className="text-xs text-muted-foreground truncate">{a.cliente} · {a.profissional}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-coral-soft flex items-center justify-center">
            <Heart className="h-5 w-5 text-coral" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Clientes Fiéis</h2>
            <p className="text-xs text-muted-foreground">Programa de fidelidade</p>
          </div>
        </div>
        <ul className="space-y-3">
          {fidelidade.map((f, i) => (
            <li key={i} className="p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-smooth">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{f.nome}</span>
                <Badge className="bg-coral-soft text-coral border-0 text-[10px]">
                  <Star className="h-3 w-3 mr-1 fill-coral" /> {f.visitas} visitas
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Último atendimento: {f.ultimo}</p>
              <p className="text-xs text-coral font-medium mt-1">🎁 {f.proxBeneficio}</p>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/* ---------- OUTROS ---------- */
function OutrosWidgets() {
  const insights = [
    { titulo: "Receita acima da média", desc: "Você está 18% acima do mês passado", icon: TrendingUp, cor: "success" },
    { titulo: "3 clientes inativos", desc: "Não compram há mais de 60 dias", icon: Heart, cor: "warning" },
    { titulo: "Oportunidade", desc: "Quartas-feiras têm menor faturamento", icon: Sparkles, cor: "info" },
  ];
  return (
    <div className="grid gap-5 mb-6">
      <Card className="p-5 shadow-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Insights do seu negócio</h2>
            <p className="text-xs text-muted-foreground">Análises geradas pela IA</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {insights.map((ins, i) => {
            const Icon = ins.icon;
            const bg = ins.cor === "success" ? "bg-success-soft" : ins.cor === "warning" ? "bg-warning-soft" : "bg-info-soft";
            const tx = ins.cor === "success" ? "text-success-deep" : ins.cor === "warning" ? "text-warning" : "text-info";
            return (
              <div key={i} className={`p-4 rounded-xl ${bg} border border-border`}>
                <Icon className={`h-5 w-5 ${tx} mb-2`} />
                <p className="text-sm font-bold text-foreground">{ins.titulo}</p>
                <p className="text-xs text-muted-foreground mt-1">{ins.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export function BusinessWidgets({ type }: { type: BusinessType }) {
  switch (type) {
    case "comercio": return <ComercioWidgets />;
    case "servicos": return <ServicosWidgets />;
    case "alimentacao": return <AlimentacaoWidgets />;
    case "beleza": return <BelezaWidgets />;
    default: return <OutrosWidgets />;
  }
}
