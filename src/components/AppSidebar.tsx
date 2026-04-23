import { LayoutDashboard, MessageCircle, Receipt, BarChart3, Package, Building2 } from "lucide-react";
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
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Início", url: "/", icon: LayoutDashboard },
  { title: "WhatsApp", url: "/whatsapp", icon: MessageCircle },
  { title: "Impostos (DAS)", url: "/impostos", icon: Receipt },
  { title: "Relatórios", url: "/relatorios", icon: BarChart3 },
  { title: "Catálogo & Clientes", url: "/catalogo", icon: Package },
  { title: "Perfil do Negócio", url: "/perfil", icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={mascot}
            alt="Mascote Conta.AI"
            width={40}
            height={40}
            loading="lazy"
            className="h-10 w-10 object-contain animate-float"
          />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-primary leading-tight">Conta.AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ERP invisível</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active}>
                      <NavLink to={item.url} end className="transition-smooth">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
