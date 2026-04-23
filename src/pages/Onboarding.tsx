import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2, ArrowRight, ArrowLeft, Check, Sparkles, PartyPopper,
  Eye, Building2, Target, ShoppingBag, CheckCircle2, AlertCircle, LayoutDashboard,
} from "lucide-react";
import { BUSINESS_LIST, BUSINESS_CONFIGS, type BusinessType } from "@/lib/businessTypes";
import mascot from "@/assets/mascot.png";
import { cn } from "@/lib/utils";

/* -------------------- Validation schemas -------------------- */

const businessTypeSchema = z.object({
  businessType: z.enum(["comercio", "servicos", "alimentacao", "beleza", "outros"], {
    errorMap: () => ({ message: "Escolha um tipo de negócio para continuar" }),
  }),
});

const businessInfoSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, { message: "Nome deve ter pelo menos 2 caracteres" })
    .max(80, { message: "Nome deve ter no máximo 80 caracteres" }),
  cnpj: z
    .string()
    .trim()
    .refine((v) => v === "" || v.replace(/\D/g, "").length === 14, {
      message: "CNPJ deve ter 14 dígitos",
    })
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine((v) => v === "" || [10, 11].includes(v.replace(/\D/g, "").length), {
      message: "Telefone deve ter 10 ou 11 dígitos com DDD",
    })
    .optional()
    .or(z.literal("")),
});

const goalSchema = z.object({
  monthlyGoal: z
    .number({ invalid_type_error: "Informe um valor numérico" })
    .min(100, { message: "Meta mínima de R$ 100" })
    .max(81000, { message: "Meta acima do limite anual MEI (R$ 81.000/ano = R$ 6.750/mês)" }),
});

/* -------------------- Step config -------------------- */

const STEPS = [
  { id: 1, label: "Negócio", icon: ShoppingBag },
  { id: 2, label: "Dados", icon: Building2 },
  { id: 3, label: "Meta", icon: Target },
  { id: 4, label: "Revisão", icon: Eye },
  { id: 5, label: "Pronto!", icon: PartyPopper },
] as const;

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState<string>("");

  const totalSteps = STEPS.length;
  const progress = (step / totalSteps) * 100;

  const config = useMemo(
    () => (businessType ? BUSINESS_CONFIGS[businessType] : null),
    [businessType]
  );

  /* -------------------- Validation per step -------------------- */

  const validateStep = (): boolean => {
    setErrors({});
    if (step === 1) {
      const result = businessTypeSchema.safeParse({ businessType });
      if (!result.success) {
        const msg = result.error.issues[0]?.message ?? "Campo obrigatório";
        toast.error(msg);
        return false;
      }
      return true;
    }
    if (step === 2) {
      const result = businessInfoSchema.safeParse({ businessName, cnpj, phone });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((i) => {
          if (i.path[0]) fieldErrors[i.path[0] as string] = i.message;
        });
        setErrors(fieldErrors);
        toast.error(result.error.issues[0]?.message ?? "Preencha os dados corretamente");
        return false;
      }
      return true;
    }
    if (step === 3) {
      const result = goalSchema.safeParse({ monthlyGoal: Number(monthlyGoal) });
      if (!result.success) {
        const msg = result.error.issues[0]?.message ?? "Defina uma meta válida";
        setErrors({ monthlyGoal: msg });
        toast.error(msg);
        return false;
      }
      return true;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;

    // Success toasts between steps
    const successMessages: Record<number, string> = {
      1: `${BUSINESS_CONFIGS[businessType!].label} selecionado ✓`,
      2: "Dados do negócio salvos ✓",
      3: "Meta definida! Vamos revisar ✓",
    };
    if (successMessages[step]) toast.success(successMessages[step]);

    setStep((s) => Math.min(s + 1, totalSteps));
  };

  const prev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  const finish = async () => {
    if (!user || !businessType) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          business_type: businessType,
          business_name: businessName.trim(),
          cnpj: cnpj || null,
          phone: phone || null,
          monthly_goal: Number(monthlyGoal),
          onboarding_completed: true,
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshProfile();
      // Move to celebration step (5)
      setStep(5);
      toast.success("🎉 Tudo pronto! Bem-vindo ao Conta.AI");
      // Auto-redirect after celebration
      setTimeout(() => navigate("/dashboard", { replace: true }), 2200);
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao salvar perfil");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Formatters -------------------- */

  const formatCnpj = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 14);
    return d
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };
  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
  };
  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  /* -------------------- Render -------------------- */

  return (
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-8 bg-background relative overflow-x-hidden">
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full gradient-primary opacity-20 blur-3xl animate-blob" />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-success/40 blur-3xl animate-blob"
        style={{ animationDelay: "2s" }}
      />

      <div className="w-full max-w-4xl relative z-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src={mascot} alt="" className="h-12 w-12 animate-float" />
          <span className="text-xl font-extrabold text-gradient-primary">Conta.AI</span>
        </div>

        {/* Stepper visual */}
        <div className="hidden sm:flex items-center justify-center gap-2 mb-6">
          {STEPS.map((s, idx) => {
            const done = step > s.id;
            const current = step === s.id;
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "flex flex-col items-center gap-1.5 transition-bounce",
                    current && "scale-110"
                  )}
                >
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-bounce",
                      done && "gradient-success text-success-foreground border-success shadow-success",
                      current && "gradient-primary text-primary-foreground border-primary shadow-glow",
                      !done && !current && "bg-muted border-border text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      current ? "text-primary" : done ? "text-success-deep" : "text-muted-foreground"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-8 md:w-16 mx-1 mt-[-18px] rounded-full transition-bounce",
                      step > s.id ? "bg-success" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        <Card className="p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-3xl border-2 shadow-glow backdrop-blur-xl bg-card/95 overflow-hidden">
          {/* Mobile progress bar */}
          <div className="sm:hidden mb-6">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-2">
              <span>Passo {step} de {totalSteps}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* ============ STEP 1: Business type ============ */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
                Que tipo de negócio você tem?
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                Vamos personalizar seu painel para cada centímetro fazer sentido.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BUSINESS_LIST.map((b) => {
                  const Icon = b.icon;
                  const selected = businessType === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBusinessType(b.id)}
                      aria-pressed={selected}
                      className={cn(
                        "group text-left p-4 rounded-2xl border-2 transition-bounce hover-lift relative overflow-hidden",
                        selected
                          ? "border-primary bg-primary-soft shadow-glow"
                          : "border-border bg-card hover:border-primary/40"
                      )}
                    >
                      {selected && (
                        <span className="absolute top-3 right-3 h-6 w-6 rounded-full gradient-primary flex items-center justify-center animate-fade-in">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </span>
                      )}
                      <div
                        className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br",
                          b.gradient
                        )}
                      >
                        <Icon className={cn("h-6 w-6", b.accent)} />
                      </div>
                      <p className="font-bold text-base">{b.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.tagline}</p>
                      <p className="text-xs text-muted-foreground/70 mt-2 leading-snug">
                        {b.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============ STEP 2: Business info ============ */}
          {step === 2 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2">
                  Sobre o seu negócio
                </h2>
                <p className="text-sm text-muted-foreground">
                  Esses dados aparecem nos seus relatórios.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="biz-name">
                  Nome do negócio (Nome Fantasia) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="biz-name"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    if (errors.businessName) setErrors((p) => ({ ...p, businessName: "" }));
                  }}
                  placeholder="Ex: Doces da Maria"
                  maxLength={80}
                  className={cn("h-11 rounded-xl", errors.businessName && "border-destructive")}
                  aria-invalid={!!errors.businessName}
                />
                {errors.businessName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.businessName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cnpj">
                    CNPJ <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => {
                      setCnpj(formatCnpj(e.target.value));
                      if (errors.cnpj) setErrors((p) => ({ ...p, cnpj: "" }));
                    }}
                    placeholder="00.000.000/0000-00"
                    className={cn("h-11 rounded-xl", errors.cnpj && "border-destructive")}
                    aria-invalid={!!errors.cnpj}
                  />
                  {errors.cnpj && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.cnpj}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">
                    WhatsApp <span className="text-muted-foreground text-xs">(opcional)</span>
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => {
                      setPhone(formatPhone(e.target.value));
                      if (errors.phone) setErrors((p) => ({ ...p, phone: "" }));
                    }}
                    placeholder="(11) 99999-9999"
                    className={cn("h-11 rounded-xl", errors.phone && "border-destructive")}
                    aria-invalid={!!errors.phone}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-info-soft border border-info/20 p-3 flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-info mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80">
                  Não tem CNPJ ainda? Sem problema — você pode adicionar depois no perfil.
                </p>
              </div>
            </div>
          )}

          {/* ============ STEP 3: Goal ============ */}
          {step === 3 && (
            <div className="animate-fade-in space-y-5">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-2">
                  Defina sua meta <Sparkles className="h-6 w-6 text-warning" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quanto você quer faturar todo mês? A gente te ajuda a chegar lá.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal">Meta de faturamento mensal</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                    R$
                  </span>
                  <Input
                    id="goal"
                    type="number"
                    inputMode="numeric"
                    value={monthlyGoal}
                    onChange={(e) => {
                      setMonthlyGoal(e.target.value);
                      if (errors.monthlyGoal) setErrors((p) => ({ ...p, monthlyGoal: "" }));
                    }}
                    placeholder="5000"
                    min={100}
                    max={81000}
                    className={cn(
                      "h-12 rounded-xl pl-10 text-lg font-bold",
                      errors.monthlyGoal && "border-destructive"
                    )}
                    aria-invalid={!!errors.monthlyGoal}
                  />
                </div>
                {errors.monthlyGoal ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> {errors.monthlyGoal}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    💡 Limite anual MEI 2025: R$ 81.000 (≈ R$ 6.750/mês).
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[3000, 5000, 6750].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setMonthlyGoal(String(v));
                      setErrors((p) => ({ ...p, monthlyGoal: "" }));
                    }}
                    className={cn(
                      "py-2.5 px-1 rounded-xl border-2 text-xs sm:text-sm font-bold transition-bounce truncate",
                      monthlyGoal === String(v)
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    R$ {v.toLocaleString("pt-BR")}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ============ STEP 4: Review + Dashboard preview ============ */}
          {step === 4 && config && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold mb-2 flex items-center gap-2">
                  Confira tudo <Eye className="h-6 w-6 text-primary" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Esse é o painel que vamos montar pra você. Pode editar a qualquer momento.
                </p>
              </div>

              {/* Confirmation summary */}
              <div className="grid sm:grid-cols-2 gap-3">
                <Card
                  className={cn(
                    "p-4 rounded-2xl border-2 bg-gradient-to-br",
                    config.gradient,
                    "border-primary/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-soft">
                      <config.icon className={cn("h-6 w-6", config.accent)} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Tipo de negócio
                      </p>
                      <p className="font-extrabold truncate">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{config.tagline}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl border-2 shadow-card">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                      <Building2 className="h-6 w-6 text-success-deep" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Negócio
                      </p>
                      <p className="font-extrabold truncate">{businessName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {cnpj || "CNPJ a definir"} · {phone || "Telefone a definir"}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-2xl border-2 shadow-card sm:col-span-2 gradient-mesh">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
                      <Target className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Meta mensal
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold text-primary truncate">
                        {formatBRL(Number(monthlyGoal))}
                      </p>
                    </div>
                    <Badge className="gradient-success text-success-foreground border-0 hidden sm:inline-flex shrink-0">
                      🚀 Vamos lá!
                    </Badge>
                  </div>
                </Card>
              </div>

              {/* Dashboard preview */}
              <div>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <LayoutDashboard className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-sm font-bold">Prévia do seu dashboard</p>
                  <Badge variant="secondary" className="text-[10px]">
                    personalizado
                  </Badge>
                </div>
                <div className="rounded-2xl border-2 border-dashed border-primary/30 p-3 md:p-4 bg-muted/30">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                    {config.metrics.map((m, i) => {
                      const Icon = m.icon;
                      const tones = [
                        "bg-primary-soft text-primary",
                        "bg-success-soft text-success-deep",
                        "bg-coral-soft text-coral",
                        "bg-info-soft text-info",
                      ];
                      return (
                        <div
                          key={m.key}
                          className="bg-card rounded-xl p-3 border shadow-soft animate-fade-in"
                          style={{ animationDelay: `${i * 80}ms` }}
                        >
                          <div
                            className={cn(
                              "h-7 w-7 rounded-lg flex items-center justify-center mb-2",
                              tones[i % 4]
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium leading-tight">
                            {m.label}
                          </p>
                          <div className="h-3 w-12 rounded bg-muted mt-1.5 animate-shimmer" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-card rounded-xl p-3 border shadow-soft">
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-2">
                      Módulos liberados pra você
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {config.modules.map((m) => (
                        <Badge
                          key={m}
                          variant="secondary"
                          className="text-[10px] capitalize bg-primary-soft text-primary border-0"
                        >
                          {m}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-success-soft border border-success/30 p-3 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success-deep mt-0.5 shrink-0" />
                <p className="text-xs text-foreground/80">
                  Tudo pronto pra começar! Você poderá ajustar qualquer informação no{" "}
                  <span className="font-bold">Perfil do Negócio</span>.
                </p>
              </div>
            </div>
          )}

          {/* ============ STEP 5: Celebration ============ */}
          {step === 5 && config && (
            <div className="animate-fade-in py-8 text-center">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 gradient-primary rounded-full blur-2xl opacity-50 animate-pulse-ring" />
                <div className="relative h-24 w-24 rounded-full gradient-success flex items-center justify-center mx-auto shadow-success">
                  <PartyPopper className="h-12 w-12 text-success-foreground" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-2">
                Tudo pronto, {(profile?.full_name || "").split(" ")[0] || "MEI"}! 🎉
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Seu painel <span className="font-bold text-foreground">{businessName}</span> foi
                criado. Estamos te levando pro dashboard...
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-primary font-bold">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando seu dashboard
              </div>
            </div>
          )}

          {/* Footer nav */}
          {step < 5 && (
            <div className="flex items-center justify-between gap-2 mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={prev}
                disabled={step === 1 || loading}
                className="rounded-xl shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              {step < 4 ? (
                <Button variant="hero" onClick={next} className="rounded-xl">
                  Próximo <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="success"
                  onClick={finish}
                  disabled={loading}
                  className="rounded-xl min-w-0"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="hidden sm:inline">Confirmar e criar painel</span>
                      <span className="sm:hidden">Confirmar</span>
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
