import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "segmented";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return variant === "icon" ? (
      <Button variant="ghost" size="icon" className={className} aria-label="Tema">
        <Sun className="h-5 w-5" />
      </Button>
    ) : (
      <div className={cn("h-10 w-full rounded-xl bg-muted/40 animate-pulse", className)} />
    );
  }

  if (variant === "icon") {
    const isDark = resolvedTheme === "dark";
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
        className={className}
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button>
    );
  }

  const options = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Escuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ] as const;

  return (
    <div className={cn("inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border", className)}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth",
              active
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
