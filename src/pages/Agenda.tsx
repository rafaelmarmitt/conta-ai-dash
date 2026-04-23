import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, User, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESS_CONFIGS } from "@/lib/businessTypes";

const agendamentos = [
  { hora: "09:00", duracao: "1h", cliente: "Ana Paula", servico: "Manicure + Pedicure", status: "confirmado", valor: 80, telefone: "(11) 98765-4321" },
  { hora: "10:30", duracao: "45min", cliente: "Beatriz S.", servico: "Design de sobrancelha", status: "confirmado", valor: 50, telefone: "(11) 99876-1234" },
  { hora: "13:00", duracao: "2h", cliente: "Carla M.", servico: "Coloração + Corte", status: "pendente", valor: 220, telefone: "(11) 91234-5678" },
  { hora: "15:30", duracao: "1h30", cliente: "Diana L.", servico: "Hidratação", status: "confirmado", valor: 120, telefone: "(11) 99999-0000" },
  { hora: "17:30", duracao: "1h", cliente: "Elena R.", servico: "Maquiagem social", status: "confirmado", valor: 150, telefone: "(11) 98888-1111" },
];

const semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Agenda() {
  const { profile } = useAuth();
  const config = profile?.business_type ? BUSINESS_CONFIGS[profile.business_type] : null;
  const totalDia = agendamentos.reduce((s, a) => s + a.valor, 0);
  const hoje = new Date().getDay();

  return (
    <DashboardLayout
      title="Agenda"
      subtitle={config ? `Seus atendimentos de ${config.label.toLowerCase()}` : "Seus atendimentos"}
      actions={
        <Button variant="hero" className="rounded-xl">
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      }
    >
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Hoje</p>
          </div>
          <p className="text-3xl font-extrabold">{agendamentos.length}</p>
          <p className="text-xs text-muted-foreground">atendimentos</p>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-info" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tempo ocupado</p>
          </div>
          <p className="text-3xl font-extrabold">6h15</p>
          <p className="text-xs text-muted-foreground">de 9h disponíveis</p>
        </Card>
        <Card className="p-5 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-success-deep" />
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Receita prevista</p>
          </div>
          <p className="text-3xl font-extrabold text-success-deep">{formatBRL(totalDia)}</p>
          <p className="text-xs text-muted-foreground">se todos confirmarem</p>
        </Card>
      </div>

      {/* Week selector */}
      <Card className="p-4 mb-6 shadow-card">
        <div className="grid grid-cols-7 gap-2">
          {semana.map((d, i) => {
            const ativo = i === (hoje === 0 ? 6 : hoje - 1);
            return (
              <button
                key={d}
                className={`p-3 rounded-xl text-center transition-bounce ${
                  ativo ? "gradient-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
                }`}
              >
                <p className="text-[10px] font-bold uppercase opacity-80">{d}</p>
                <p className="text-xl font-extrabold mt-1">{15 + i}</p>
                <p className={`text-[10px] mt-1 ${ativo ? "opacity-90" : "text-muted-foreground"}`}>
                  {[3, 5, 4, 5, 7, 6, 0][i]} agend.
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Lista do dia */}
      <Card className="p-5 shadow-card">
        <h2 className="text-base font-bold mb-4">Hoje · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</h2>
        <ul className="space-y-3">
          {agendamentos.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover-lift transition-bounce animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-center shrink-0">
                <p className="text-xl font-extrabold text-primary">{a.hora}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{a.duracao}</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="font-bold truncate">{a.cliente}</p>
                  <Badge
                    className={`text-[10px] border-0 ${
                      a.status === "confirmado" ? "bg-success-soft text-success-deep" : "bg-warning-soft text-warning-deep"
                    }`}
                  >
                    {a.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{a.servico}</p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3" /> {a.telefone}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-extrabold text-success-deep">{formatBRL(a.valor)}</p>
                <Button size="sm" variant="ghost" className="h-7 text-[11px] mt-1">
                  Ver detalhes →
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </DashboardLayout>
  );
}
