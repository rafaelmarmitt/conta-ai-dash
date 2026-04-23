import { LayoutDashboard, MessageCircle, Receipt, BarChart3, Package, Building2, Sparkles, Calendar, ChefHat, Box, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import mascot from "@/assets/mascot.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { BUSINESS_CONFIGS } from "@/lib/businessTypes";

type ModuleKey = "inicio" | "whatsapp" | "impostos" | "relatorios" | "catalogo" | "agenda" | "estoque" | "cardapio" | "perfil";

const ALL_ITEMS: Record<ModuleKey, { title: string; url: string; icon: typeof LayoutDashboard; badge?: string }> = {
  inicio: { title: "Início", url: "/", icon: LayoutDashboard },
  whatsapp: { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle, badge: "Bot" },
  impostos: { title: "Impostos (DAS)", url: "/impostos", icon: Receipt, badge: "1" },
  relatorios: { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  agenda: { title: "Agenda", url: "/agenda", icon: Calendar },
  estoque: { title: "Estoque", url: "/estoque", icon: Box },
  catalogo: { title: "Catálogo & Clientes", url: "/catalogo", icon: Package },
  cardapio: { title: "Cardápio", url: "/catalogo", icon: ChefHat },
  perfil: { title: "Perfil do Negócio", url: "/perfil", icon: Building2 },
};

const DEFAULT_MODULES: ModuleKey[] = ["inicio", "whatsapp", "impostos", "relatorios", "catalogo", "perfil"];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const config = profile?.business_type ? BUSINESS_CONFIGS[profile.business_type] : null;
  const modules = (config?.modules ?? DEFAULT_MODULES) as ModuleKey[];
  const items = modules.map((m) => ALL_ITEMS[m]).filter(Boolean);

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute inset-0 gradient-primary rounded-2xl blur-md opacity-40" />
            <img
              src={mascot}
              alt="Mascote Conta.AI"
              width={44}
              height={44}
              className="relative h-11 w-11 object-contain animate-float"
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold text-gradient-primary leading-tight">Conta.AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {config ? config.label : "ERP invisível"}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
            Menu principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className="h-11 rounded-xl font-medium transition-bounce data-[active=true]:gradient-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-glow"
                    >
                      <NavLink to={item.url} end>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge
                                className={`h-5 text-[10px] px-1.5 border-0 ${
                                  active ? "bg-white/25 text-white" : "bg-coral text-primary-foreground"
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 space-y-2">
        {!collapsed && (
          <div className="rounded-2xl gradient-hero p-4 text-primary-foreground relative overflow-hidden">
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-success/40 blur-2xl animate-blob" />
            <div className="relative">
              <Sparkles className="h-5 w-5 mb-2" />
              <p className="text-sm font-bold leading-tight">Upgrade Pro</p>
              <p className="text-xs text-primary-foreground/80 mt-0.5 mb-3">Relatórios IA + N8N ilimitado</p>
              <button className="text-[11px] font-bold bg-white text-primary-deep px-3 py-1.5 rounded-lg hover:bg-success hover:text-success-foreground transition-bounce">
                Saiba mais →
              </button>
            </div>
          </div>
        )}
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive-soft transition-bounce"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sair</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
