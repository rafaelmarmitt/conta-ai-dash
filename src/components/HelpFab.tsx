import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HelpCircle, MessageCircle, Sparkles, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Command {
  trigger: string;
  desc: string;
  example: string;
}

const COMMANDS: { category: string; items: Command[] }[] = [
  {
    category: "💰 Vendas e recebimentos",
    items: [
      { trigger: "Vendi", desc: "Registra uma venda", example: "Vendi R$ 50 de bolo para a Maria" },
      { trigger: "Recebi", desc: "Registra um Pix/dinheiro", example: "Recebi R$ 200 via Pix do João" },
      { trigger: "Cliente", desc: "Cadastra um novo cliente", example: "Novo cliente: Ana, telefone 11 99999-0000" },
    ],
  },
  {
    category: "💸 Despesas e contas",
    items: [
      { trigger: "Gastei", desc: "Registra uma despesa", example: "Gastei R$ 80 com fornecedor de chocolate" },
      { trigger: "Conta", desc: "Lança uma conta fixa", example: "Conta de luz R$ 150 venceu hoje" },
    ],
  },
  {
    category: "📦 Estoque e produtos",
    items: [
      { trigger: "Estoque", desc: "Atualiza o estoque", example: "Comprei 100 unidades de leite condensado" },
      { trigger: "Produto", desc: "Cria um produto novo", example: "Novo produto: Brigadeiro gourmet, R$ 3,50" },
    ],
  },
  {
    category: "📊 Consultas rápidas",
    items: [
      { trigger: "Quanto", desc: "Consulta saldo do dia/mês", example: "Quanto vendi hoje?" },
      { trigger: "DAS", desc: "Mostra o imposto do mês", example: "Qual o valor do DAS desse mês?" },
    ],
  },
];

export function HelpFab() {
  const [open, setOpen] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(key);
    toast.success("Comando copiado!");
    setTimeout(() => setCopiedIdx(null), 1800);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          aria-label="Abrir guia de comandos do bot"
          className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-glow hover:scale-105 transition-bounce focus-visible:ring-4 focus-visible:ring-primary/40"
          size="icon"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-whatsapp-soft flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-whatsapp" />
            </div>
            <div>
              <SheetTitle>Comandos do bot</SheetTitle>
              <SheetDescription>Escreva no WhatsApp e veja a mágica</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="p-3 rounded-xl bg-info-soft border border-info/20 flex items-start gap-2">
            <Sparkles className="h-4 w-4 text-info mt-0.5 shrink-0" />
            <p className="text-xs text-foreground">
              Basta mandar mensagens em linguagem natural — o bot interpreta e atualiza este painel automaticamente.
            </p>
          </div>

          {COMMANDS.map((group) => (
            <section key={group.category} aria-label={group.category}>
              <h3 className="text-sm font-bold text-foreground mb-2">{group.category}</h3>
              <ul className="space-y-2">
                {group.items.map((cmd) => {
                  const key = `${group.category}-${cmd.trigger}`;
                  return (
                    <li key={key} className="p-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-smooth">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <Badge className="bg-primary-soft text-primary-deep border-0 font-mono text-[11px]">{cmd.trigger}</Badge>
                        <button
                          onClick={() => copy(cmd.example, key)}
                          className="text-muted-foreground hover:text-primary transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                          aria-label={`Copiar exemplo: ${cmd.example}`}
                        >
                          {copiedIdx === key ? <Check className="h-3.5 w-3.5 text-success-deep" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{cmd.desc}</p>
                      <p className="text-[12px] font-medium text-foreground italic">"{cmd.example}"</p>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <div className="p-3 rounded-xl bg-primary-soft border border-primary/20 text-center">
            <p className="text-xs text-foreground">
              Não conectou o bot ainda?{" "}
              <a href="/whatsapp" className="font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
                Vincule seu WhatsApp
              </a>
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
