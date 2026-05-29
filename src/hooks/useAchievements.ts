import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AchievementId = "first_sale" | "sales_100" | "taxes_5_paid" | "goal_3_months" | "customers_10";

export type Achievement = {
  id: AchievementId;
  titulo: string;
  desc: string;
  emoji: string;
  done: boolean;
  progress: number;
  target: number;
  detail: string;
};

type Metrics = {
  salesCount: number;
  paidTaxesCount: number;
  goalMonthsCount: number;
  customersCount: number;
};

const emptyMetrics: Metrics = {
  salesCount: 0,
  paidTaxesCount: 0,
  goalMonthsCount: 0,
  customersCount: 0,
};

const getSeenKey = (userId: string) => `nexitt-achievements-seen:${userId}`;

const readSeen = (userId: string) => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(getSeenKey(userId)) || "[]"));
  } catch {
    return new Set<string>();
  }
};

const writeSeen = (userId: string, ids: string[]) => {
  localStorage.setItem(getSeenKey(userId), JSON.stringify(Array.from(new Set(ids))));
};

const getStoredSeen = (userId: string) => {
  const key = getSeenKey(userId);
  return {
    key,
    raw: localStorage.getItem(key),
    seen: readSeen(userId),
  };
};

const monthKey = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const buildAchievements = (metrics: Metrics): Achievement[] => [
  {
    id: "first_sale",
    titulo: "Primeira venda",
    desc: "Registre sua primeira venda no Nexitt",
    emoji: "\u{1F389}",
    done: metrics.salesCount >= 1,
    progress: Math.min(metrics.salesCount, 1),
    target: 1,
    detail: `${metrics.salesCount}/1 venda`,
  },
  {
    id: "sales_100",
    titulo: "100 vendas",
    desc: "Atinja a marca de 100 vendas registradas",
    emoji: "\u{1F3C6}",
    done: metrics.salesCount >= 100,
    progress: Math.min(metrics.salesCount, 100),
    target: 100,
    detail: `${metrics.salesCount}/100 vendas`,
  },
  {
    id: "taxes_5_paid",
    titulo: "DAS em dia",
    desc: "Marque 5 meses de DAS como pagos",
    emoji: "\u{1F4C5}",
    done: metrics.paidTaxesCount >= 5,
    progress: Math.min(metrics.paidTaxesCount, 5),
    target: 5,
    detail: `${metrics.paidTaxesCount}/5 DAS pagos`,
  },
  {
    id: "goal_3_months",
    titulo: "Meta batida",
    desc: "Bata sua meta mensal em 3 meses diferentes",
    emoji: "\u{1F680}",
    done: metrics.goalMonthsCount >= 3,
    progress: Math.min(metrics.goalMonthsCount, 3),
    target: 3,
    detail: `${metrics.goalMonthsCount}/3 meses`,
  },
  {
    id: "customers_10",
    titulo: "Cliente fiel",
    desc: "Cadastre ou venda para 10 clientes",
    emoji: "\u{1F91D}",
    done: metrics.customersCount >= 10,
    progress: Math.min(metrics.customersCount, 10),
    target: 10,
    detail: `${metrics.customersCount}/10 clientes`,
  },
];

export function useAchievements(refreshKey?: unknown) {
  const { user, profile } = useAuth();
  const [metrics, setMetrics] = useState<Metrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const achievements = useMemo(() => buildAchievements(metrics), [metrics]);

  const load = useCallback(async () => {
    if (!user) {
      setMetrics(emptyMetrics);
      setNewlyUnlocked([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const monthlyGoal = Number(profile?.monthly_goal || 0);

    const salesForGoalsPromise = monthlyGoal > 0
      ? supabase.from("sales").select("total,sold_at,status").eq("user_id", user.id).neq("status", "cancelado")
      : Promise.resolve({ data: [] as Array<{ total: number; sold_at: string; status?: string }> });

    const [{ count: salesCount }, { count: customersCount }, { data: paidTaxes }, { data: salesForGoals }] = await Promise.all([
      supabase.from("sales").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("status", "cancelado"),
      supabase.from("customers").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("taxes").select("id").eq("user_id", user.id).eq("status", "pago"),
      salesForGoalsPromise,
    ]);

    const monthlyTotals = new Map<string, number>();
    (salesForGoals || []).forEach((sale: any) => {
      const key = monthKey(sale.sold_at);
      monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + Number(sale.total || 0));
    });

    const nextMetrics = {
      salesCount: salesCount ?? 0,
      customersCount: customersCount ?? 0,
      paidTaxesCount: paidTaxes?.length ?? 0,
      goalMonthsCount: monthlyGoal > 0 ? Array.from(monthlyTotals.values()).filter((total) => total >= monthlyGoal).length : 0,
    };

    setMetrics(nextMetrics);
    const nextAchievements = buildAchievements(nextMetrics);
    const storedSeen = getStoredSeen(user.id);
    const seen = storedSeen.raw
      ? storedSeen.seen
      : new Set(nextAchievements.filter((achievement) => achievement.done).map((achievement) => achievement.id));

    if (!storedSeen.raw) {
      writeSeen(user.id, Array.from(seen));
    }

    const nextNew = nextAchievements.filter((achievement) => achievement.done && !seen.has(achievement.id));
    setNewlyUnlocked(nextNew);
    setLoading(false);
  }, [profile?.monthly_goal, user]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`achievements-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "sales", filter: `user_id=eq.${user.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "customers", filter: `user_id=eq.${user.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "taxes", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, user]);

  const markSeen = useCallback((ids?: string[]) => {
    if (!user) return;
    const seen = readSeen(user.id);
    (ids ?? newlyUnlocked.map((achievement) => achievement.id)).forEach((id) => seen.add(id));
    writeSeen(user.id, Array.from(seen));
    setNewlyUnlocked((current) => current.filter((achievement) => !seen.has(achievement.id)));
  }, [newlyUnlocked, user]);

  return { achievements, loading, newlyUnlocked, markSeen, reload: load };
}
