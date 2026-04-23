import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  text: string;
  label?: string;
  size?: "sm" | "icon" | "default";
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
}

export function CopyButton({ text, label, size = "icon", className, variant = "ghost" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copiado para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("transition-bounce", copied && "text-success-deep", className)}
      aria-label="Copiar"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {label && <span>{copied ? "Copiado!" : label}</span>}
    </Button>
  );
}
