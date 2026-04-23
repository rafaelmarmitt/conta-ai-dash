import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, Sparkles, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import mascot from "@/assets/mascot.png";

export default function Auth() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">("signup");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      if (profile && !profile.onboarding_completed) navigate("/onboarding", { replace: true });
      else navigate("/", { replace: true });
    }
  }, [user, profile, authLoading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: fullName },
        },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Este e-mail já está cadastrado. Faça login.");
          setTab("login");
        } else {
          toast.error(error.message);
        }
        return;
      }
      toast.success("Conta criada! Vamos configurar seu negócio.");
    } catch (err) {
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message.includes("Invalid") ? "E-mail ou senha incorretos." : error.message);
        return;
      }
      toast.success("Bem-vindo de volta!");
    } catch {
      toast.error("Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-background">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full gradient-primary opacity-20 blur-3xl animate-blob" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-success/40 blur-3xl animate-blob" style={{ animationDelay: "2s" }} />

      {/* Left – Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 w-1/2 relative z-10 gradient-mesh">
        <div className="flex items-center gap-3">
          <img src={mascot} alt="Conta.AI" className="h-14 w-14 animate-float" />
          <div>
            <p className="text-2xl font-extrabold text-gradient-primary">Conta.AI</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">ERP invisível para MEI</p>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            Seu negócio rodando no <span className="text-gradient-primary">WhatsApp</span>.
          </h1>
          <p className="text-base text-muted-foreground">
            Registre vendas, controle despesas e nunca mais esqueça do DAS — tudo conversando com nosso bot.
          </p>
          <ul className="space-y-3">
            {[
              "Configure em 2 minutos",
              "Dashboard adaptado ao seu tipo de negócio",
              "Lembretes automáticos de impostos",
              "Relatórios mensais prontos para o contador",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm font-medium">
                <span className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Conta.AI · Feito para o microempreendedor brasileiro</p>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <img src={mascot} alt="Conta.AI" className="h-12 w-12 animate-float" />
            <p className="text-2xl font-extrabold text-gradient-primary">Conta.AI</p>
          </div>

          <Card className="p-6 md:p-8 rounded-3xl border-2 shadow-glow backdrop-blur-xl bg-card/95">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6 h-11 bg-muted rounded-xl p-1">
                <TabsTrigger value="signup" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow font-semibold">
                  Criar conta
                </TabsTrigger>
                <TabsTrigger value="login" className="rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-glow font-semibold">
                  Entrar
                </TabsTrigger>
              </TabsList>

              <TabsContent value="signup" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold flex items-center gap-2">
                    Comece grátis <Sparkles className="h-5 w-5 text-warning" />
                  </h2>
                  <p className="text-sm text-muted-foreground">Sem cartão de crédito. 30 segundos.</p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-name">Seu nome</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Maria Silva" required className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" required className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-pwd">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="signup-pwd" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" required minLength={6} className="pl-9 pr-10 h-11 rounded-xl" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full mt-2 rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Criar minha conta <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="login" className="space-y-4 mt-0">
                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold">Bem-vindo de volta 👋</h2>
                  <p className="text-sm text-muted-foreground">Continue de onde parou.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="login-pwd">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="login-pwd" type={showPwd ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-9 pr-10 h-11 rounded-xl" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full mt-2 rounded-xl">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Entrar <ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-[11px] text-center text-muted-foreground mt-6">
              Ao continuar, você concorda com nossos <Link to="#" className="text-primary hover:underline">Termos</Link> e <Link to="#" className="text-primary hover:underline">Privacidade</Link>.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
