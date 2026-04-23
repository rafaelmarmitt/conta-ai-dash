import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import mascot from "@/assets/mascot.png";
import { Bell, Search, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

const notifications = [
  { title: "Nova venda registrada", desc: "Maria S. — R$ 180", time: "5 min" },
  { title: "DAS vence em 12 dias", desc: "R$ 75,90 pendente", time: "1 h" },
  { title: "Bot conectado", desc: "WhatsApp online", time: "3 h" },
];

export function DashboardLayout({ title, subtitle, actions, children }: Props) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border bg-card/80 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30 backdrop-blur-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <SidebarTrigger className="hover:bg-primary-soft hover:text-primary" />
              <div className="hidden md:flex relative max-w-md flex-1 ml-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes, produtos, transações..."
                  className="pl-9 bg-muted/50 border-transparent focus-visible:bg-card focus-visible:border-primary/30 h-9 rounded-xl"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" aria-label="Ajuda" className="hidden sm:inline-flex">
                <HelpCircle className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Notificações" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-coral ring-2 ring-card animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    Notificações
                    <Badge className="bg-primary text-primary-foreground border-0">{notifications.length}</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((n, i) => (
                    <DropdownMenuItem key={i} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
                      <p className="text-sm font-semibold">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.desc} · há {n.time}</p>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center gap-2 pl-2 ml-1 border-l border-border">
                <img
                  src={mascot}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  className="h-9 w-9 object-contain animate-wave"
                />
                <div className="hidden lg:flex flex-col leading-tight">
                  <span className="text-xs font-bold text-foreground">Maria Silva</span>
                  <span className="text-[10px] text-muted-foreground">MEI · Plano Free</span>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 animate-fade-in">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">{title}</h1>
                {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
