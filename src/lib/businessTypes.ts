import {
  ShoppingBag, Briefcase, UtensilsCrossed, Scissors, Sparkles,
  Package, Calendar, ChefHat, Heart, Box,
  TrendingUp, Clock, Receipt, Users, Wallet,
  type LucideIcon
} from "lucide-react";

export type BusinessType = "comercio" | "servicos" | "alimentacao" | "beleza" | "outros";

export interface BusinessConfig {
  id: BusinessType;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for accent ring/icon */
  accent: string;
  /** Tailwind background gradient utility */
  gradient: string;
  /** Visible modules in sidebar */
  modules: Array<"inicio" | "whatsapp" | "impostos" | "relatorios" | "catalogo" | "agenda" | "estoque" | "cardapio" | "perfil">;
  /** Dashboard KPI cards */
  metrics: Array<{
    key: string;
    label: string;
    icon: LucideIcon;
    suffix?: string;
    format?: "currency" | "number" | "percent" | "time";
  }>;
  /** Quick categories (for catalog/products) */
  catalogLabel: string;
  /** Recent activity emoji palette */
  activityEmojis: string[];
}

export const BUSINESS_CONFIGS: Record<BusinessType, BusinessConfig> = {
  comercio: {
    id: "comercio",
    label: "Comércio / Vendas",
    tagline: "Vende produtos físicos",
    description: "Loja, revenda, distribuição. Foco em estoque e ticket médio.",
    icon: ShoppingBag,
    accent: "text-primary",
    gradient: "from-primary/20 via-primary-soft to-success/20",
    modules: ["inicio", "whatsapp", "impostos", "relatorios", "catalogo", "estoque", "perfil"],
    metrics: [
      { key: "faturamento", label: "Faturamento Mensal", icon: Wallet, format: "currency" },
      { key: "ticket", label: "Ticket Médio", icon: TrendingUp, format: "currency" },
      { key: "estoque", label: "Itens em Estoque", icon: Package, format: "number" },
      { key: "clientes", label: "Clientes Ativos", icon: Users, format: "number" },
    ],
    catalogLabel: "Produtos",
    activityEmojis: ["🛍️", "📦", "🛒", "💳", "🏷️"],
  },
  servicos: {
    id: "servicos",
    label: "Prestação de Serviços",
    tagline: "Vende seu tempo / expertise",
    description: "Consultoria, autônomo, freelancer. Foco em agenda e horas faturadas.",
    icon: Briefcase,
    accent: "text-info",
    gradient: "from-info/20 via-info-soft to-primary/20",
    modules: ["inicio", "whatsapp", "impostos", "relatorios", "agenda", "catalogo", "perfil"],
    metrics: [
      { key: "faturamento", label: "Faturamento Mensal", icon: Wallet, format: "currency" },
      { key: "horas", label: "Horas Faturadas", icon: Clock, suffix: "h", format: "number" },
      { key: "agenda", label: "Atendimentos no Mês", icon: Calendar, format: "number" },
      { key: "clientes", label: "Clientes Ativos", icon: Users, format: "number" },
    ],
    catalogLabel: "Serviços",
    activityEmojis: ["💼", "📅", "✅", "🤝", "📞"],
  },
  alimentacao: {
    id: "alimentacao",
    label: "Alimentação",
    tagline: "Cozinha, doces, lanches",
    description: "Confeitaria, food truck, marmitas. Foco em pedidos e cardápio.",
    icon: UtensilsCrossed,
    accent: "text-coral",
    gradient: "from-coral/20 via-coral-soft to-warning-soft",
    modules: ["inicio", "whatsapp", "impostos", "relatorios", "cardapio", "estoque", "perfil"],
    metrics: [
      { key: "faturamento", label: "Faturamento Mensal", icon: Wallet, format: "currency" },
      { key: "pedidos", label: "Pedidos no Mês", icon: ChefHat, format: "number" },
      { key: "ticket", label: "Ticket Médio", icon: TrendingUp, format: "currency" },
      { key: "clientes", label: "Clientes Recorrentes", icon: Users, format: "number" },
    ],
    catalogLabel: "Cardápio",
    activityEmojis: ["🍰", "🍕", "🥗", "☕", "🍔"],
  },
  beleza: {
    id: "beleza",
    label: "Beleza & Estética",
    tagline: "Salão, manicure, estética",
    description: "Cabelo, unhas, estética, barbearia. Foco em agenda e pacotes.",
    icon: Scissors,
    accent: "text-success-deep",
    gradient: "from-success/20 via-success-soft to-primary-soft",
    modules: ["inicio", "whatsapp", "impostos", "relatorios", "agenda", "catalogo", "perfil"],
    metrics: [
      { key: "faturamento", label: "Faturamento Mensal", icon: Wallet, format: "currency" },
      { key: "agenda", label: "Atendimentos no Mês", icon: Calendar, format: "number" },
      { key: "ticket", label: "Ticket Médio", icon: TrendingUp, format: "currency" },
      { key: "clientes", label: "Clientes Fidelizados", icon: Heart, format: "number" },
    ],
    catalogLabel: "Serviços & Pacotes",
    activityEmojis: ["💅", "💇‍♀️", "💄", "✨", "💆"],
  },
  outros: {
    id: "outros",
    label: "Outros",
    tagline: "Modelo de negócio próprio",
    description: "Para quem tem um modelo único. Dashboard balanceado.",
    icon: Sparkles,
    accent: "text-primary",
    gradient: "from-primary/20 via-info-soft to-coral-soft",
    modules: ["inicio", "whatsapp", "impostos", "relatorios", "catalogo", "perfil"],
    metrics: [
      { key: "faturamento", label: "Faturamento Mensal", icon: Wallet, format: "currency" },
      { key: "despesas", label: "Despesas", icon: Receipt, format: "currency" },
      { key: "lucro", label: "Lucro Líquido", icon: TrendingUp, format: "currency" },
      { key: "clientes", label: "Clientes", icon: Users, format: "number" },
    ],
    catalogLabel: "Catálogo",
    activityEmojis: ["✨", "📈", "💰", "📌", "🎯"],
  },
};

export const BUSINESS_LIST: BusinessConfig[] = Object.values(BUSINESS_CONFIGS);

export const MODULE_META: Record<string, { title: string; url: string; icon: LucideIcon; badge?: string }> = {
  inicio: { title: "Início", url: "/", icon: TrendingUp },
  whatsapp: { title: "WhatsApp", url: "/whatsapp", icon: Package, badge: "Bot" },
  impostos: { title: "Impostos (DAS)", url: "/impostos", icon: Receipt, badge: "1" },
  relatorios: { title: "Relatórios", url: "/relatorios", icon: TrendingUp },
  catalogo: { title: "Catálogo & Clientes", url: "/catalogo", icon: Box },
  agenda: { title: "Agenda", url: "/agenda", icon: Calendar },
  estoque: { title: "Estoque", url: "/estoque", icon: Package },
  cardapio: { title: "Cardápio", url: "/catalogo", icon: ChefHat },
  perfil: { title: "Perfil do Negócio", url: "/perfil", icon: Users },
};
