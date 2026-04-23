import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { BUSINESS_LIST, type BusinessType } from "@/lib/businessTypes";
import mascot from "@/assets/mascot.png";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState<string>("");

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const next = () => {
    if (step === 1 && !businessType) {
      toast.error("Escolha um tipo de negócio");
      return;
    }
    if (step === 2 && !businessName.trim()) {
      toast.error("Informe o nome do seu negócio");
      return;
    }
    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const finish = async () => {
    if (!user || !businessType) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_type: businessType,
          business_name: businessName,
          cnpj: cnpj || null,
          phone: phone || null,
          monthly_goal: monthlyGoal ? Number(monthlyGoal) : 0,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      toast.success("Tudo pronto! Bem-vindo ao Conta.AI 🎉");
      navigate("/", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  const formatCnpj = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 14);
    return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
  };
  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-background relative overflow-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full gradient-primary opacity-20 blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-success/40 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-3xl relative z-10">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={mascot} alt="" className="h-12 w-12 animate-float" />
          <span className="text-xl font-extrabold text-gradient-primary">Conta.AI</span>
        </div>

        <Card className="p-6 md:p-10 rounded-3xl border-2 shadow-glow backdrop-blur-xl bg-card/95">
          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
              <span>Passo {step} de {totalSteps}</span>
              <span className="text-primary">{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step 1: Business type */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Que tipo de negócio você tem?</h2>
              <p className="text-sm text-muted-foreground mb-6">Vamos personalizar seu painel pra cada centímetro fazer sentido.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_LIST.map((b) => {
                  const Icon = b.icon;
                  const selected = businessType === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBusinessType(b.id)}
                      className={cn(
                        "group text-left p-4 rounded-2xl border-2 transition-bounce hover-lift relative overflow-hidden",
                        selected
                          ? "border-primary bg-primary-soft shadow-glow"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      {selected && (
                        <span className="absolute top-3 right-3 h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </span>
                      )}
                      <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br", b.gradient)}>
                        <Icon className={cn("h-6 w-6", b.accent)} />
                      </div>
                      <p className="font-bold text-base">{b.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.tagline}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2 leading-snug">{b.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Business info */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Sobre o seu negócio</h2>
                <p className="text-sm text-muted-foreground">Esses dados aparecem nos seus relatórios.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-name">Nome do negócio (Nome Fantasia) *</Label>
                <Input id="biz-name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Ex: Doces da Maria" className="h-11 rounded-xl" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">CNPJ <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(formatCnpj(e.target.value))} placeholder="00.000.000/0000-00" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">WhatsApp <span className="text-muted-foreground text-xs">(opcional)</span></Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(11) 99999-9999" className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-2">
                  Defina sua meta <Sparkles className="h-6 w-6 text-warning" />
                </h2>
                <p className="text-sm text-muted-foreground">Quanto você quer faturar todo mês? A gente te ajuda a chegar lá.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal">Meta de faturamento mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">R$</span>
                  <Input id="goal" type="number" value={monthlyGoal} onChange={(e) => setMonthlyGoal(e.target.value)} placeholder="5.000" className="h-12 rounded-xl pl-10 text-lg font-bold" />
                </div>
                <p className="text-xs text-muted-foreground">💡 Limite anual MEI 2025: R$ 81.000 (≈ R$ 6.750/mês).</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[3000, 5000, 6750].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMonthlyGoal(String(v))}
                    className={cn(
                      "py-2.5 rounded-xl border-2 text-sm font-bold transition-bounce",
                      monthlyGoal === String(v) ? "border-primary bg-primary-soft text-primary" : "border-border hover:border-primary/40"
                    )}
                  >
                    R$ {v.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer nav */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="ghost" onClick={prev} disabled={step === 1} className="rounded-xl">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            {step < totalSteps ? (
              <Button variant="hero" onClick={next} className="rounded-xl">
                Próximo <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="success" onClick={finish} disabled={loading} className="rounded-xl">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Concluir <Check className="h-4 w-4" /></>}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
