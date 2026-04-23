import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface InfoTooltipProps {
  label: string;
  content: ReactNode;
  className?: string;
}

/**
 * Pequeno ícone "?" com tooltip acessível para explicar termos técnicos
 * (DAS, Lucro Líquido, MRR, Inventory, etc.).
 */
export function InfoTooltip({ label, content, className }: InfoTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Mais informações sobre ${label}`}
          className={`inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full ${className ?? ""}`}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
