import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2, Target, Save, Trophy, Award, Sparkles, Bell,
  CreditCard, Lock, Camera
} from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/CopyButton";

const Perfil = () => {
  const meta = 8000;
  const atual = 7300;
  const pct = Math.round((atual / meta) * 100);

  const conquistas = [
    { titulo: "Primeira venda", desc: "Você registrou sua 1ª venda", emoji: "🎉", done: true },
    { titulo: "100 vendas", desc: "Atingiu a marca de 100 vendas", emoji: "💯", done: true },
    { titulo: "DAS em dia", desc: "5 meses pagando em dia", emoji: "✅", done: true },
    { titulo: "Meta batida", desc: "Bata a meta mensal 3x", emoji: "🎯", done: false },
    { titulo: "Cliente fiel", desc: "10 clientes recorrentes", emoji: "💎", done: false },
  ];

  return (
    <DashboardLayout title="Perfil do Negócio" subtitle="Gerencie dados, metas e configurações">
      <Tabs defaultValue="dados" className="w-full">
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
              <div className="relative w-32 h-32 mx-auto mb-4 group cursor-pointer">
                <div className="absolute inset-0 gradient-primary rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-smooth" />
                <div className="relative w-32 h-32 rounded-full gradient-primary text-primary-foreground flex items-center justify-center text-5xl font-extrabold shadow-glow">
                  M
                </div>
                <div className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-card border-2 border-border flex items-center justify-center shadow-soft group-hover:scale-110 transition-bounce">
                  <Camera className="h-4 w-4" />
                </div>
              </div>
              <p className="font-extrabold text-lg">Maria Silva</p>
              <p className="text-xs text-muted-foreground">Doces da Maria</p>
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
                    <h2 className="text-base font-bold">Meta mensal — Junho</h2>
                    <p className="text-xs text-muted-foreground">Faturamento bruto</p>
                  </div>
                </div>
                <p className="text-5xl font-extrabold text-gradient-primary">R$ {atual.toLocaleString("pt-BR")}</p>
                <p className="text-sm text-muted-foreground mb-5">de R$ {meta.toLocaleString("pt-BR")}</p>
                <Progress value={pct} className="h-4 mb-3" />
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm font-bold text-success-deep">{pct}% concluído 🎯</p>
                  <p className="text-sm text-muted-foreground">Faltam <span className="font-bold text-foreground">R$ {(meta - atual).toLocaleString("pt-BR")}</span></p>
                </div>
                <div className="space-y-3 max-w-md">
                  <Label htmlFor="meta">Definir nova meta (R$)</Label>
                  <div className="flex gap-2">
                    <Input id="meta" type="number" defaultValue={meta} />
                    <Button variant="success" onClick={() => toast.success("Meta atualizada!")}>Atualizar</Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <h3 className="text-base font-bold mb-4">Histórico de metas</h3>
              <div className="space-y-3">
                {[
                  { mes: "Maio", meta: 7000, real: 6100, ok: false },
                  { mes: "Abril", meta: 6000, real: 4900, ok: false },
                  { mes: "Março", meta: 5000, real: 5200, ok: true },
                  { mes: "Fev", meta: 4000, real: 3800, ok: false },
                  { mes: "Jan", meta: 4000, real: 4200, ok: true },
                ].map((m) => (
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
                <p className="text-xs text-muted-foreground">{conquistas.filter((c) => c.done).length} de {conquistas.length} desbloqueadas</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conquistas.map((c, i) => (
                <Card
                  key={i}
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
            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-info-soft flex items-center justify-center">
                  <Bell className="h-5 w-5 text-info" />
                </div>
                <h2 className="text-base font-bold">Notificações</h2>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Nova venda registrada", desc: "Receber notificação no WhatsApp" },
                  { label: "DAS próximo do vencimento", desc: "Avisar 5 dias antes" },
                  { label: "Meta mensal próxima", desc: "Quando faltar 10% para bater" },
                  { label: "Resumo semanal", desc: "Toda segunda às 9h" },
                  { label: "Limite MEI próximo", desc: "Alerta ao atingir 80% do teto" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
                    <div>
                      <p className="text-sm font-semibold">{n.label}</p>
                      <p className="text-xs text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-11 w-11 rounded-2xl bg-coral-soft flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-coral" />
                </div>
                <h2 className="text-base font-bold">Plano e cobrança</h2>
              </div>
              <div className="rounded-2xl gradient-hero p-5 text-primary-foreground mb-4 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-success/30 blur-2xl animate-blob" />
                <div className="relative">
                  <Badge className="bg-white/20 text-white border-0 mb-2">Plano Atual</Badge>
                  <p className="text-2xl font-extrabold mb-1">Free Forever</p>
                  <p className="text-sm opacity-90">100 mensagens/mês · 1 número</p>
                </div>
              </div>
              <Button variant="hero" className="w-full">
                <Sparkles className="h-4 w-4" /> Upgrade para Pro — R$ 29/mês
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-3">
                Mensagens ilimitadas · Múltiplos números · IA avançada
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Perfil;
