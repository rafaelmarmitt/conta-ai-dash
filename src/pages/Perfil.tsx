import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Target, Save, Trophy, Award, Sparkles,
  CreditCard, Lock, Palette
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";
import { AvatarUpload } from "@/components/AvatarUpload";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAchievements } from "@/hooks/useAchievements";
import { supabase } from "@/integrations/supabase/client";

const formatBRL = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const MES_ABBR = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const Perfil = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const validTabs = ["dados", "metas", "conquistas", "config"];
  const activeTab = validTabs.includes(tabParam || "") ? (tabParam as string) : "dados";

  const displayName = profile?.full_name || profile?.business_name || "Usuário";
  const businessName = profile?.business_name || "Configure seu negócio";
  const initial = displayName.charAt(0).toUpperCase();

  const [goalInput, setGoalInput] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [goalHistory, setGoalHistory] = useState<Array<{ mes: string; meta: number; real: number; ok: boolean }>>([]);

  const meta = profile?.monthly_goal && profile.monthly_goal > 0 ? Number(profile.monthly_goal) : 8000;
  const atual = monthRevenue;
  const pct = meta > 0 ? Math.min(Math.round((atual / meta) * 100), 100) : 0;
  const faltam = Math.max(meta - atual, 0);
  const currentMonthName = MES_ABBR[new Date().getMonth()];

  const { achievements: conquistas, loading: conquistasLoading } = useAchievements();

  useEffect(() => {
    setGoalInput(String(profile?.monthly_goal && profile.monthly_goal > 0 ? profile.monthly_goal : 8000));
  }, [profile?.monthly_goal]);

  useEffect(() => {
    const loadGoalData = async () => {
      if (!user) return;

      const now = new Date();
      const fiveMonthsStart = new Date(now.getFullYear(), now.getMonth() - 4, 1);
      const { data, error } = await supabase
        .from("sales")
        .select("total,sold_at,status")
        .eq("user_id", user.id)
        .neq("status", "cancelado")
        .gte("sold_at", fiveMonthsStart.toISOString());

      if (error) {
        toast.error("Erro ao carregar metas");
        return;
      }

      const totals = new Map<string, number>();
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        totals.set(`${date.getFullYear()}-${date.getMonth()}`, 0);
      }

      (data || []).forEach((sale: any) => {
        const date = new Date(sale.sold_at);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        if (totals.has(key)) {
          totals.set(key, (totals.get(key) || 0) + Number(sale.total || 0));
        }
      });

      const currentKey = `${now.getFullYear()}-${now.getMonth()}`;
      setMonthRevenue(totals.get(currentKey) || 0);
      setGoalHistory(Array.from(totals.entries()).map(([key, real]) => {
        const [, month] = key.split("-").map(Number);
        return { mes: MES_ABBR[month], meta, real, ok: real >= meta };
      }));
    };

    loadGoalData();
  }, [meta, user]);

  const saveMonthlyGoal = async () => {
    if (!user) return;

    const nextGoal = Number(goalInput);
    if (!Number.isFinite(nextGoal) || nextGoal < 100 || nextGoal > 81000) {
      toast.error("Defina uma meta entre R$ 100 e R$ 81.000");
      return;
    }

    setSavingGoal(true);
    const { error } = await supabase
      .from("profiles")
      .update({ monthly_goal: nextGoal })
      .eq("user_id", user.id);

    setSavingGoal(false);
    if (error) {
      toast.error("Erro ao atualizar meta");
      return;
    }

    await refreshProfile();
    toast.success("Meta atualizada!");
  };

  return (
    <>
      <Seo title="Perfil do Negócio · Nexitt" description="Gerencie dados do seu MEI, metas mensais, preferências de tema e configurações de conta." path="/perfil" />
    <DashboardLayout title="Perfil do Negócio" subtitle="Gerencie dados, metas e configurações">
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
        <TabsList className="mb-5 bg-card border border-border p-1 rounded-xl">
          <TabsTrigger value="dados" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Dados</TabsTrigger>
          <TabsTrigger value="metas" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Metas</TabsTrigger>
          <TabsTrigger value="conquistas" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Conquistas</TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="dados" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-6 shadow-card lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Dados da empresa</h2>
                  <p className="text-xs text-muted-foreground">MEI — Microempreendedor Individual</p>
                </div>
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); toast.success("Perfil atualizado com sucesso!"); }}
                className="grid gap-4 md:grid-cols-2"
              >
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="fantasia">Nome Fantasia</Label>
                  <Input id="fantasia" defaultValue="Doces da Maria" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="flex gap-2">
                    <Input id="cnpj" defaultValue="12.345.678/0001-99" />
                    <CopyButton text="12345678000199" variant="outline" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cnae">CNAE Principal</Label>
                  <Input id="cnae" defaultValue="1093-7/01 - Confeitaria" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" defaultValue="maria@docesdamaria.com.br" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade / UF</Label>
                  <Input id="cidade" defaultValue="São Paulo / SP" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio do negócio (aparece no bot)</Label>
                  <Textarea id="bio" rows={3} defaultValue="Confeitaria artesanal com bolos e doces feitos com carinho. Encomendas com 48h de antecedência. ❤️" />
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" variant="success">
                    <Save className="h-4 w-4" /> Salvar alterações
                  </Button>
                </div>
              </form>
            </Card>

            <Card className="p-6 shadow-card text-center">
              <AvatarUpload size={128} fallbackInitial={initial} className="mb-4" />
              <p className="font-extrabold text-lg">{displayName}</p>
              <p className="text-xs text-muted-foreground">{businessName}</p>
              <Badge className="mt-3 gradient-primary text-primary-foreground border-0">Plano Free</Badge>
              <Button variant="outline" className="w-full mt-4" size="sm">
                <Sparkles className="h-3.5 w-3.5" /> Upgrade Pro
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metas" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="p-6 shadow-card lg:col-span-2 gradient-mesh border-primary/20 relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-success/20 blur-3xl animate-blob" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl gradient-success flex items-center justify-center shadow-success">
                    <Target className="h-5 w-5 text-success-foreground" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold">Meta mensal — {currentMonthName}</h2>
                    <p className="text-xs text-muted-foreground">Faturamento bruto</p>
                  </div>
                </div>
                <p className="text-5xl font-extrabold text-gradient-primary">{formatBRL(atual)}</p>
                <p className="text-sm text-muted-foreground mb-5">de {formatBRL(meta)}</p>
                <Progress value={pct} className="h-4 mb-3" />
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-bold text-success-deep">{pct}% concluído 🎯</p>
                  <p className="text-sm text-muted-foreground">Faltam <span className="font-bold text-foreground">{formatBRL(faltam)}</span></p>
                </div>
                <div className="space-y-3 max-w-md">
                  <Label htmlFor="meta">Definir nova meta (R$)</Label>
                  <div className="flex gap-2">
                    <Input id="meta" type="number" min={100} max={81000} step={50} value={goalInput} onChange={(e) => setGoalInput(e.target.value)} />
                    <Button variant="success" onClick={saveMonthlyGoal} disabled={savingGoal}>{savingGoal ? "Salvando..." : "Atualizar"}</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="text-base font-bold mb-4">Histórico de metas</h3>
              <div className="space-y-3">
                {goalHistory.map((m) => (
                  <div key={m.mes} className="flex items-center gap-3">
                    <span className="text-sm font-semibold w-12">{m.mes}</span>
                    <div className="flex-1">
                      <Progress value={(m.real / m.meta) * 100} className="h-2" />
                    </div>
                    {m.ok ? (
                      <Badge className="bg-success-soft text-success-deep border-0 text-[10px]">✓</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">{Math.round((m.real / m.meta) * 100)}%</Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conquistas" className="mt-0">
          <Card className="p-6 shadow-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl gradient-coral flex items-center justify-center shadow-coral">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-bold">Suas conquistas</h2>
                <p className="text-xs text-muted-foreground">{conquistasLoading ? "Calculando..." : `${conquistas.filter((c) => c.done).length} de ${conquistas.length} desbloqueadas`}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conquistas.map((c, i) => (
                <Card
                  key={c.id}
                  className={`p-5 border-2 transition-smooth animate-fade-in ${
                    c.done
                      ? "border-warning/40 bg-warning-soft/40 hover-lift"
                      : "border-dashed border-border bg-muted/20 opacity-60 grayscale"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="text-5xl mb-3">{c.emoji}</div>
                  <p className="font-bold text-foreground">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                  <div className="mt-4 space-y-2">
                    <Progress value={Math.min((c.progress / c.target) * 100, 100)} className="h-2" />
                    <p className="text-[11px] font-semibold text-muted-foreground">{c.detail}</p>
                  </div>
                  {c.done ? (
                    <Badge className="mt-3 bg-warning text-warning-foreground border-0">
                      <Award className="h-3 w-3 mr-1" /> Desbloqueada
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="mt-3"><Lock className="h-3 w-3 mr-1" /> Bloqueada</Badge>
                  )}
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <div className="grid gap-5 lg:grid-cols-2">
            <Card className="p-6 shadow-card lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-primary-soft flex items-center justify-center">
                  <Palette className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Aparência</h2>
                  <p className="text-xs text-muted-foreground">Escolha entre claro, escuro ou seguir o sistema</p>
                </div>
              </div>
              <ThemeToggle variant="segmented" />
            </Card>
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-coral-soft flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-coral" />
                </div>
                <h2 className="text-base font-bold">Plano e cobranca</h2>
              </div>
              <div className="rounded-2xl gradient-hero p-5 text-primary-foreground mb-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-success/30 blur-2xl animate-blob" />
                <div className="relative">
                  <Badge className="bg-white/20 text-white border-0 mb-2">Plano Atual</Badge>
                  <p className="text-2xl font-extrabold mb-1">Free Forever</p>
                  <p className="text-sm opacity-90">100 mensagens/mes - 1 numero</p>
                </div>
              </div>
              <Button variant="hero" className="w-full">
                <Sparkles className="h-4 w-4" /> Upgrade para Pro - R$ 50/mes
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Mensagens ilimitadas - Multiplos numeros - IA avancada
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
    </>
  );
};

export default Perfil;
