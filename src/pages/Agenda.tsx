import { DashboardLayout } from "@/components/DashboardLayout";
import { Seo } from "@/components/Seo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Plus, Clock, User, Phone, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESS_CONFIGS } from "@/lib/businessTypes";
import { supabase } from "@/integrations/supabase/client";
import { MockBadge } from "@/components/MockBadge";

interface AgItem {
  hora: string;
  duracao: string;
  cliente: string;
  servico: string;
  status: string;
  valor: number;
  telefone: string;
}

const AGENDAMENTOS_MOCK: AgItem[] = [
  { hora: "09:00", duracao: "1h", cliente: "Ana Paula", servico: "Manicure + Pedicure", status: "confirmado", valor: 80, telefone: "(11) 98765-4321" },
  { hora: "10:30", duracao: "45min", cliente: "Beatriz S.", servico: "Design de sobrancelha", status: "confirmado", valor: 50, telefone: "(11) 99876-1234" },
  { hora: "13:00", duracao: "2h", cliente: "Carla M.", servico: "Coloração + Corte", status: "pendente", valor: 220, telefone: "(11) 91234-5678" },
  { hora: "15:30", duracao: "1h30", cliente: "Diana L.", servico: "Hidratação", status: "confirmado", valor: 120, telefone: "(11) 99999-0000" },
  { hora: "17:30", duracao: "1h", cliente: "Elena R.", servico: "Maquiagem social", status: "confirmado", valor: 150, telefone: "(11) 98888-1111" },
];

const semana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
const formatBRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDur = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h${min % 60 ? (min % 60) + "min" : ""}` : `${min}min`);

export default function Agenda() {
  const { profile, user } = useAuth();
  const config = profile?.business_type ? BUSINESS_CONFIGS[profile.business_type] : null;
  const [agendamentos, setAgendamentos] = useState<AgItem[]>(AGENDAMENTOS_MOCK);
  const [isMock, setIsMock] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end = new Date(); end.setHours(23, 59, 59, 999);
      const { data } = await supabase
        .from("appointments")
        .select("scheduled_at, duration_minutes, service_name, status, price, customers(name, phone)")
        .eq("user_id", user.id)
        .gte("scheduled_at", start.toISOString())
        .lte("scheduled_at", end.toISOString())
        .order("scheduled_at", { ascending: true });
      if (!data || data.length === 0) {
        setAgendamentos(AGENDAMENTOS_MOCK);
        setIsMock(true);
        return;
      }
      setAgendamentos(data.map((a: any) => ({
        hora: new Date(a.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        duracao: fmtDur(a.duration_minutes || 60),
        cliente: a.customers?.name || "Cliente",
        servico: a.service_name,
        status: a.status,
        valor: Number(a.price || 0),
        telefone: a.customers?.phone || "",
      })));
      setIsMock(false);
    };
    load();
  }, [user]);

  const totalDia = agendamentos.reduce((s, a) => s + a.valor, 0);
  const hoje = new Date().getDay();

  return (
    <>
      <Seo title="Agenda · Conta.AI" description="Organize compromissos, atendimentos e lembretes do seu MEI em um único lugar integrado ao WhatsApp." path="/agenda" />
    <DashboardLayout
      title="Agenda"
      subtitle={config ? `Seus atendimentos de ${config.label.toLowerCase()}` : "Seus atendimentos"}
      actions={
        <Button variant="hero" className="rounded-xl">
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      }
    >
      <div className="mb-4"><MockBadge show={isMock} /></div>

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

      <Card className="p-4 mb-6 shadow-card overflow-hidden">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 -mx-1 sm:mx-0">
          {semana.map((d, i) => {
            const ativo = i === (hoje === 0 ? 6 : hoje - 1);
            return (
              <button
                key={d}
                className={`min-w-0 p-2 sm:p-3 rounded-xl text-center transition-bounce ${
                  ativo ? "gradient-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
                }`}
              >
                <p className="text-[10px] font-bold uppercase opacity-80">{d}</p>
                <p className="text-lg sm:text-xl font-extrabold mt-1">{15 + i}</p>
                <p className={`text-[9px] sm:text-[10px] mt-1 ${ativo ? "opacity-90" : "text-muted-foreground"}`}>
                  {[3, 5, 4, 5, 7, 6, 0][i]} <span className="hidden sm:inline">agend.</span>
                </p>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-base font-bold mb-4">Hoje · {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</h2>
        <ul className="space-y-3">
          {agendamentos.map((a, i) => (
            <li
              key={i}
              className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover-lift transition-bounce animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="text-center shrink-0">
                <p className="text-xl font-extrabold text-primary">{a.hora}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{a.duracao}</p>
              </div>
              <div className="hidden sm:block h-12 w-px bg-border" />
              <div className="flex-1 min-w-0 basis-[60%] sm:basis-auto">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <p className="font-bold truncate min-w-0">{a.cliente}</p>
                  <Badge
                    className={`text-[10px] border-0 shrink-0 ${
                      a.status === "confirmado" ? "bg-success-soft text-success-deep" : "bg-warning-soft text-warning-deep"
                    }`}
                  >
                    {a.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{a.servico}</p>
                {a.telefone && (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="h-3 w-3 shrink-0" /> {a.telefone}
                  </p>
                )}
              </div>
              <div className="ml-auto sm:ml-0 text-right shrink-0">
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
    </>
  );
}
