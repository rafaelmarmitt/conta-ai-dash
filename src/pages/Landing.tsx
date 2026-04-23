import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MessageCircle, BarChart3, Receipt, FileText, Bell,
  ShieldCheck, Smartphone, Sparkles, ArrowRight, Check,
  Zap, Lock, Wifi, Instagram, Facebook, Linkedin, Mail
} from "lucide-react";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.png";
import heroMockup from "@/assets/hero-mockup.png";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/60">
        <nav className="container mx-auto flex items-center justify-between px-4 md:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={mascot} alt="Conta.AI" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-lg font-extrabold tracking-tight">
              Conta<span className="text-primary">.AI</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <a href="#como-funciona" className="hover:text-foreground transition-smooth">Como funciona</a>
            <a href="#funcionalidades" className="hover:text-foreground transition-smooth">Funcionalidades</a>
            <a href="#beneficios" className="hover:text-foreground transition-smooth">Benefícios</a>
            <a href="#faq" className="hover:text-foreground transition-smooth">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild className="rounded-full bg-success hover:bg-success/90 text-success-foreground font-bold shadow-success">
              <Link to="/auth">Começar grátis</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 gradient-mesh opacity-80" />
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-success/20 blur-3xl" />
        <div className="absolute top-40 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />

        <div className="container mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={fade}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-soft text-primary text-xs font-bold mb-5">
                <Sparkles className="h-3.5 w-3.5" /> O ERP invisível para MEIs
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
                Gerencie sua empresa{" "}
                <span className="text-gradient-primary">sem sair do WhatsApp</span>.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-xl">
                O ERP invisível que cuida das suas finanças, gera notas e relatórios enquanto você foca no que importa: <span className="font-semibold text-foreground">seu negócio</span>.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full bg-success hover:bg-success/90 text-success-foreground font-extrabold text-base h-14 px-7 shadow-success transition-bounce hover:scale-[1.02]">
                  <Link to="/auth">
                    Começar Gratuitamente <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full font-bold text-base h-14 px-7 border-2">
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-deep" /> Setup em 30 segundos</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-deep" /> 100% pelo WhatsApp</div>
                <div className="flex items-center gap-1.5"><Check className="h-4 w-4 text-success-deep" /> Dados criptografados</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              className="relative"
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-success/15 to-transparent rounded-[3rem] blur-2xl" />
              <img
                src={heroMockup}
                alt="Mockup do Conta.AI mostrando WhatsApp e dashboard"
                width={1280}
                height={960}
                className="w-full h-auto drop-shadow-2xl"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-2 -left-2 sm:left-4 bg-card rounded-2xl shadow-card border border-border p-3 flex items-center gap-2.5 max-w-[220px]"
              >
                <div className="h-9 w-9 rounded-full bg-success-soft flex items-center justify-center shrink-0">
                  <Zap className="h-4 w-4 text-success-deep" />
                </div>
                <div>
                  <p className="text-xs font-bold">Venda registrada ✓</p>
                  <p className="text-[10px] text-muted-foreground">R$ 50,00 — agora</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fade}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Em 3 passos</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2">Simples como mandar mensagem</h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Sem instalar nada. Sem aprender sistema. Sem dor de cabeça.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            {[
              { num: "1", icon: Smartphone, title: "Conecte seu número", desc: "Cadastro em segundos. Você recebe um número do bot e já está pronto." },
              { num: "2", icon: MessageCircle, title: "Mande uma mensagem", desc: "Envie 'Vendi 50 reais' ou um áudio. A IA entende e registra na hora." },
              { num: "3", icon: BarChart3, title: "Veja seu dashboard", desc: "Acesse relatórios, gráficos e insights com IA quando precisar." },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                custom={i}
                initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.4 }} variants={fade}
                className="relative bg-background rounded-3xl p-6 md:p-8 shadow-card border border-border hover:shadow-glow hover:border-primary/40 transition-smooth"
              >
                <div className="relative mb-5">
                  <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <s.icon className="h-9 w-9 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-success text-success-foreground text-sm font-extrabold flex items-center justify-center shadow-success">
                    {s.num}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold">{s.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fade}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Tudo que você precisa</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2">Funcionalidades principais</h2>
            <p className="text-muted-foreground mt-3 text-base sm:text-lg">
              Um ERP completo na sua palma da mão.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {[
              { icon: MessageCircle, title: "Bot de WhatsApp", desc: "Registre vendas e despesas por voz ou texto, com confirmação instantânea.", tone: "primary" },
              { icon: BarChart3, title: "Dashboard Inteligente", desc: "Visualize lucro, fluxo de caixa e crescimento em gráficos claros.", tone: "info" },
              { icon: Receipt, title: "Gestão de DAS", desc: "Lembretes automáticos do boleto mensal. Nunca mais esqueça de pagar.", tone: "coral" },
              { icon: FileText, title: "Notas Fiscais", desc: "Emita notas via comando no WhatsApp com integração simplificada.", tone: "success" },
              { icon: Bell, title: "Relatórios Automáticos", desc: "Receba resumos semanais e alertas direto no seu celular.", tone: "warning" },
              { icon: ShieldCheck, title: "Segurança Total", desc: "Criptografia ponta a ponta e backups diários dos seus dados.", tone: "primary" },
            ].map((f, i) => {
              const toneMap: Record<string, { bg: string; text: string }> = {
                primary: { bg: "bg-primary-soft", text: "text-primary" },
                info: { bg: "bg-info-soft", text: "text-info" },
                coral: { bg: "bg-coral-soft", text: "text-coral" },
                success: { bg: "bg-success-soft", text: "text-success-deep" },
                warning: { bg: "bg-warning-soft", text: "text-warning" },
              };
              const t = toneMap[f.tone];
              return (
                <motion.div
                  key={f.title}
                  custom={i}
                  initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={fade}
                  className="group bg-card rounded-3xl p-6 border border-border hover:border-primary/40 hover:-translate-y-1 transition-smooth shadow-soft hover:shadow-card"
                >
                  <div className={`h-12 w-12 rounded-2xl ${t.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-bounce`}>
                    <f.icon className={`h-6 w-6 ${t.text}`} />
                  </div>
                  <h3 className="text-lg font-extrabold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="py-20 md:py-28 bg-card">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 gradient-primary rounded-[3rem] blur-3xl opacity-30" />
              <div className="relative bg-background rounded-[2.5rem] p-8 md:p-10 border border-border shadow-card">
                <img src={mascot} alt="Mascote Conta.AI" width={200} height={200} className="mx-auto h-48 w-48 object-contain animate-float" />
                <div className="mt-6 text-center">
                  <p className="text-2xl font-extrabold">Olá! Eu sou o Conti 👋</p>
                  <p className="text-sm text-muted-foreground mt-2">Seu contador digital sempre no WhatsApp</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fade}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Por que Conta.AI</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2 leading-tight">
                Liberdade para focar no <span className="text-gradient-primary">seu negócio</span>
              </h2>

              <ul className="mt-8 space-y-5">
                {[
                  { icon: Zap, title: "Diga adeus às planilhas complicadas", desc: "Tudo automatizado por mensagem. Sem fórmulas, sem aba travando." },
                  { icon: Smartphone, title: "Controle financeiro na palma da mão", desc: "Veja quanto faturou hoje sem abrir o computador." },
                  { icon: Lock, title: "Segurança total com criptografia", desc: "Seus dados protegidos com padrão bancário de proteção." },
                ].map((b, i) => (
                  <motion.li
                    key={b.title}
                    custom={i}
                    initial="hidden" whileInView="show" viewport={{ once: true }} variants={fade}
                    className="flex gap-4"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-success-soft text-success-deep flex items-center justify-center shrink-0">
                      <b.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-lg">{b.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>

              <Button asChild size="lg" className="mt-10 rounded-full bg-success hover:bg-success/90 text-success-foreground font-extrabold h-14 px-7 shadow-success">
                <Link to="/auth">Quero testar agora <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.div
            initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fade}
            className="text-center mb-12"
          >
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Dúvidas frequentes</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-2">Perguntas frequentes</h2>
          </motion.div>

          <Accordion type="single" collapsible className="space-y-3">
            {[
              {
                q: "Meus dados financeiros estão seguros?",
                a: "Sim. Usamos criptografia de ponta a ponta no padrão bancário, servidores certificados e backups diários. Apenas você tem acesso aos seus dados.",
              },
              {
                q: "Como funciona o teste grátis?",
                a: "Você cria sua conta em 30 segundos, sem cartão de crédito, e tem 14 dias para usar todas as funcionalidades. Depois, escolhe o plano que faz sentido pra você.",
              },
              {
                q: "Preciso instalar algum aplicativo?",
                a: "Não. O Conta.AI funciona 100% pelo WhatsApp que você já usa. Para ver dashboards e relatórios completos, basta acessar nosso site pelo navegador.",
              },
              {
                q: "Vocês usam IA e tecnologia de ponta?",
                a: "Sim. Por trás do bot rodam fluxos com tecnologia de ponta (incluindo automações N8N e modelos de IA generativa) que entendem suas mensagens, voz e até comprovantes em foto.",
              },
              {
                q: "Funciona para qualquer tipo de negócio?",
                a: "Funciona para Comércio, Prestação de Serviços, Alimentação, Beleza & Estética e outros modelos de MEI. O dashboard se adapta ao seu tipo de negócio.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="bg-card rounded-2xl border border-border px-5 data-[state=open]:border-primary/40 data-[state=open]:shadow-card transition-smooth"
              >
                <AccordionTrigger className="text-left font-bold hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }} viewport={{ once: true, amount: 0.3 }}
            className="relative gradient-hero rounded-[2.5rem] p-10 md:p-16 text-center text-primary-foreground overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-success/30 blur-3xl animate-blob" />
            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-primary-glow/30 blur-3xl animate-blob" />
            <div className="relative">
              <Wifi className="h-10 w-10 mx-auto mb-4 opacity-90" />
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
                Pronto para gerenciar sua empresa pelo WhatsApp?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-primary-foreground/85 max-w-xl mx-auto">
                Mais de 5.000 MEIs já simplificaram sua gestão. Junte-se a eles hoje.
              </p>
              <Button asChild size="lg" className="mt-8 rounded-full bg-success hover:bg-success/90 text-success-foreground font-extrabold text-base h-14 px-8 shadow-success transition-bounce hover:scale-[1.03]">
                <Link to="/auth">Começar Gratuitamente <ArrowRight className="h-5 w-5" /></Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5">
                <img src={mascot} alt="Conta.AI" width={36} height={36} className="h-9 w-9 object-contain" />
                <span className="text-lg font-extrabold tracking-tight">
                  Conta<span className="text-primary">.AI</span>
                </span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground max-w-sm">
                O ERP invisível para MEIs. Gestão completa pelo WhatsApp, sem complicação.
              </p>
              <div className="mt-5 flex gap-2">
                {[
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Linkedin, label: "LinkedIn" },
                  { Icon: Mail, label: "E-mail" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-smooth"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="font-bold text-sm mb-3">Produto</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#funcionalidades" className="hover:text-foreground">Funcionalidades</a></li>
                <li><a href="#como-funciona" className="hover:text-foreground">Como funciona</a></li>
                <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
                <li><Link to="/auth" className="hover:text-foreground">Começar</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-sm mb-3">Empresa</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Política de privacidade</a></li>
                <li><a href="#" className="hover:text-foreground">Termos de uso</a></li>
                <li><a href="mailto:contato@conta.ai" className="hover:text-foreground">Contato</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Conta.AI. Todos os direitos reservados.</p>
            <p>Feito com 💚 para MEIs do Brasil</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
