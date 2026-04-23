import { ReactNode } from "react";
import mascot from "@/assets/mascot.png";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  /** Mostra um CTA padrão para abrir a página do WhatsApp */
  whatsappCta?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Estado vazio amigável usando o mascote da Conta.AI.
 * Exibido quando uma tabela ou gráfico não tem dados ainda.
 */
export function EmptyState({ title, description, action, whatsappCta, size = "md" }: EmptyStateProps) {
  const mascotSize = size === "sm" ? "h-16 w-16" : size === "lg" ? "h-32 w-32" : "h-24 w-24";
  const titleSize = size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center text-center px-4 py-8 gap-3 animate-fade-in"
    >
      <img
        src={mascot}
        alt="Mascote Conta.AI"
        className={`${mascotSize} animate-float drop-shadow-lg`}
        loading="lazy"
      />
      <div className="space-y-1 max-w-sm">
        <h3 className={`${titleSize} font-bold text-foreground`}>{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {action ?? (whatsappCta && (
        <Button variant="hero" className="rounded-xl mt-2" asChild>
          <a href="/whatsapp" aria-label="Ir para a tela de conexão com o WhatsApp">
            <MessageCircle className="h-4 w-4" /> Registrar pelo WhatsApp
          </a>
        </Button>
      ))}
    </div>
  );
}
