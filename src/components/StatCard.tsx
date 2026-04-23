import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string;
  hint?: string;
  trend?: number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "destructive" | "info" | "coral";
  accent?: boolean;
}

const toneMap = {
  primary: { bg: "bg-primary-soft", text: "text-primary", grad: "gradient-primary", shadow: "shadow-glow" },
  success: { bg: "bg-success-soft", text: "text-success-deep", grad: "gradient-success", shadow: "shadow-success" },
  warning: { bg: "bg-warning-soft", text: "text-warning", grad: "gradient-coral", shadow: "shadow-coral" },
  destructive: { bg: "bg-destructive-soft", text: "text-destructive", grad: "gradient-coral", shadow: "shadow-coral" },
  info: { bg: "bg-info-soft", text: "text-info", grad: "gradient-info", shadow: "shadow-glow" },
  coral: { bg: "bg-coral-soft", text: "text-coral", grad: "gradient-coral", shadow: "shadow-coral" },
};

export function StatCard({ label, value, hint, trend, icon: Icon, tone = "primary", accent = false }: Props) {
  const t = toneMap[tone];
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 border-border/60 hover-lift animate-fade-in group",
        accent ? `${t.grad} text-primary-foreground border-0 ${t.shadow}` : "shadow-card bg-card",
      )}
    >
      <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-10 group-hover:opacity-20 transition-smooth"
           style={{ background: accent ? "white" : `hsl(var(--${tone}))` }} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={cn("text-xs font-semibold uppercase tracking-wider", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {label}
          </p>
          <p className={cn("text-2xl md:text-3xl font-bold mt-2 truncate", accent ? "text-primary-foreground" : "text-foreground")}>
            {value}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            {trend !== undefined && (
              <span className={cn(
                "inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md",
                trend >= 0
                  ? accent ? "bg-white/20 text-white" : "bg-success-soft text-success-deep"
                  : accent ? "bg-white/20 text-white" : "bg-destructive-soft text-destructive"
              )}>
                {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(trend)}%
              </span>
            )}
            {hint && (
              <p className={cn("text-xs", accent ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {hint}
              </p>
            )}
          </div>
        </div>
        <div className={cn(
          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-bounce group-hover:scale-110 group-hover:rotate-6",
          accent ? "bg-white/20 text-primary-foreground" : `${t.bg} ${t.text}`,
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
