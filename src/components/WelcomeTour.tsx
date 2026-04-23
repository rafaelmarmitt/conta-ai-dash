import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Smartphone,
  Target,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Copy,
} from "lucide-react";
import mascot from "@/assets/mascot.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const STEP_COUNT = 3;

export function WelcomeTour() {
  const { profile, user, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && profile.onboarding_completed && !(profile as any).welcome_tour_completed) {
      setOpen(true);
      setGoal(profile.monthly_goal ? String(profile.monthly_goal) : "");
    }
  }, [profile]);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const goalNum = Number(goal.replace(/\D/g, ""));
    const updates: { welcome_tour_completed: boolean; monthly_goal?: number } = {
      welcome_tour_completed: true,
    };
    if (goalNum > 0) updates.monthly_goal = goalNum;
    const { error } = await supabase.from("profiles").update(updates).eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Não conseguimos salvar agora. Tente novamente.");
      return;
    }
    await refreshProfile();
    toast.success("Tudo pronto! Bons negócios 🚀");
    setOpen(false);
  };

  const copyExample = () => {
    navigator.clipboard.writeText("Vendi R$ 50 de bolo para a Maria");
    toast.success("Exemplo copiado!");
  };

  const next = () => setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-0 shadow-glow">
        <div className="gradient-mesh px-6 pt-6 pb-4 relative">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <img src={mascot} alt="" className="h-14 w-14 animate-float drop-shadow-md" />
            <div className="flex-1 min-w-0">
              <Badge className="bg-primary-soft text-primary-deep border-0 mb-1 text-[10px]">
                Passo {step + 1} de {STEP_COUNT}
              </Badge>
              <DialogHeader className="text-left space-y-0.5">
                <DialogTitle className="text-lg sm:text-xl">
                  {step === 0 && "Bem-vindo ao Conta.AI! 👋"}
                  {step === 1 && "Comandos do bot 💬"}
                  {step === 2 && "Defina sua meta mensal 🎯"}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {step === 0 && "Vamos te mostrar como tudo funciona em 3 passos rápidos."}
                  {step === 1 && "É só escrever em linguagem natural — fácil assim."}
                  {step === 2 && "Para acompanhar seu progresso em tempo real."}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>

          <div className="flex gap-1.5 mt-4" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEP_COUNT}>
            {Array.from({ length: STEP_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-primary/15"}`}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
          {step === 0 && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-whatsapp-soft border border-whatsapp/20">
                <Smartphone className="h-5 w-5 text-whatsapp shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground text-sm">Conecte seu WhatsApp</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escaneie o QR Code dentro de "WhatsApp → Conectar". Nossa tecnologia segura faz a ponte entre o seu Zap e este painel.
                  </p>
                  <Button size="sm" variant="outline" className="rounded-lg mt-2" asChild>
                    <Link to="/whatsapp" onClick={() => setOpen(false)}>
                      <MessageCircle className="h-3.5 w-3.5" /> Conectar agora
                    </Link>
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                💡 Você pode pular esse passo e conectar depois — o painel funciona com dados de exemplo.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <div className="rounded-xl border border-border p-4 bg-card">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Exemplo</p>
                <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-whatsapp-soft border border-whatsapp/20">
                  <p className="text-sm font-medium text-foreground italic">"Vendi R$ 50 de bolo para a Maria"</p>
                  <button
                    onClick={copyExample}
                    aria-label="Copiar exemplo"
                    className="text-whatsapp hover:scale-110 transition-bounce p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" /> O bot registra a venda e atualiza o seu painel automaticamente.
                </p>
              </div>

              <ul className="space-y-2">
                {[
                  { c: "Gastei R$ 80 com fornecedor", e: "💸 Lança despesa" },
                  { c: "Quanto vendi hoje?", e: "📊 Consulta saldo" },
                  { c: "Novo cliente: Ana, 11 99999-0000", e: "👤 Cadastra cliente" },
                ].map((cmd, i) => (
                  <li key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/70 transition-smooth">
                    <span className="text-xs font-medium text-foreground italic truncate">"{cmd.c}"</span>
                    <span className="text-[10px] font-bold text-primary whitespace-nowrap">{cmd.e}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl gradient-mesh border border-primary/20">
                <Target className="h-6 w-6 text-primary shrink-0" />
                <p className="text-sm text-foreground">
                  Defina quanto você quer faturar este mês para acompanhar o progresso no topo do dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-input" className="text-sm font-semibold">
                  Meta mensal (R$)
                </Label>
                <Input
                  id="goal-input"
                  inputMode="numeric"
                  placeholder="Ex.: 5000"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value.replace(/\D/g, ""))}
                  className="h-12 text-base rounded-xl"
                  aria-describedby="goal-hint"
                />
                <p id="goal-hint" className="text-xs text-muted-foreground">
                  Você pode atualizar essa meta a qualquer momento no seu perfil.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[3000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setGoal(String(val))}
                    className={`p-2 rounded-lg border text-xs font-bold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      goal === String(val)
                        ? "border-primary bg-primary-soft text-primary-deep"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    R$ {val.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-border bg-muted/30 px-6 py-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0 || saving}
            className="rounded-lg"
            aria-label="Voltar para o passo anterior"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Voltar</span>
          </Button>

          {step < STEP_COUNT - 1 ? (
            <Button onClick={next} variant="hero" className="rounded-lg">
              Próximo <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={finish} variant="hero" className="rounded-lg" disabled={saving}>
              {saving ? "Salvando..." : <>Concluir <Check className="h-4 w-4" /></>}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
