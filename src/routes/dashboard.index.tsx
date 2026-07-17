import { IphoneShortcutBanner } from "@/components/dashboard/IphoneShortcutBanner";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Plus,
  Palette,
  ExternalLink,
  CircleDot,
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Store,
  ArrowRight,
  Zap,
  Wallet,
  Loader2,
  Pencil,
  BarChart3,
  Truck,
  Mic,
  Rocket,
  Check,
  User,
  ChevronRight,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useSubscription } from "@/hooks/use-subscription";
import { useCountUp } from "@/hooks/use-count-up";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { InstalledAppsSection } from "@/components/dashboard/InstalledAppsSection";
import { StoreProgressCard } from "@/components/dashboard/StoreProgressCard";
import { WindowsAppBanner } from "@/components/dashboard/WindowsAppBanner";
import { Img } from "@/components/ui/Img";
import { GamificationHub } from "@/components/dashboard/core-loop/GamificationHub";
import { useServerFn } from "@tanstack/react-start";
import { getGamification, type GamificationData } from "@/lib/core-loop";
import {
  getZRExpressBalance,
  type ZRExpressBalanceResult,
} from "@/lib/delivery/zrexpress-balance.functions";
import { formatPrice as fmtPrice } from "@/lib/storeTheme";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
  head: () => ({
    meta: [{ title: "Dashboard — Fennecly" }],
  }),
});

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  shipped: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  delivered: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  refunded: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const STATUS_DOT_COLORS: Record<string, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-violet-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-red-500",
  refunded: "bg-rose-500",
};

function DashboardHome() {
  const { user } = useAuth();
  const { currentStore } = useCurrentStore();
  const { t } = useTranslation();
  const { status, daysRemaining, hadPaidSubscription } = useSubscription();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [hasPendingPayment, setHasPendingPayment] = useState(false);
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    customers: 0,
  });
  const [sparklineOrders, setSparklineOrders] = useState<number[]>([]);
  const [sparklineRevenue, setSparklineRevenue] = useState<number[]>([]);
  const [recentOrders, setRecentOrders] = useState<
    Array<{
      id: string;
      customer_name: string;
      total: number;
      status: string;
      created_at: string;
      product_name: string | null;
      product_image: string | null;
      item_count: number;
    }>
  >([]);
  const [gamiData, setGamiData] = useState<GamificationData | null>(null);
  const [gamiLoading, setGamiLoading] = useState(true);
  const callGami = useServerFn(getGamification);
  const [storeSettings, setStoreSettings] = useState<{
    store_name: string | null;
    logo_url: string | null;
    theme: string | null;
    is_active: boolean | null;
  } | null>(null);
  const [zrBalance, setZrBalance] = useState<ZRExpressBalanceResult | null>(null);
  const callZrBalance = useServerFn(getZRExpressBalance);
  const [screenshotLoaded, setScreenshotLoaded] = useState(false);
  const [screenshotError, setScreenshotError] = useState(false);

  const loadDashboard = useCallback(() => {
    if (!user) return;
    const storeId = currentStore?.id ?? null;
    let cancelled = false;

    supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data?.name) setName(data.name);
      });

    supabase
      .from("store_settings")
      .select("store_name, logo_url, theme, is_active")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) setStoreSettings(data);
      });

    supabase
      .from("payment_submissions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) setHasPendingPayment((data?.length ?? 0) > 0);
      });

    const scopedProducts = () => {
      let q = supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (storeId) q = q.eq("store_id", storeId);
      return q;
    };
    const scopedOrdersCount = () => {
      let q = supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("store_owner_id", user.id);
      if (storeId) q = q.eq("store_id", storeId);
      return q;
    };
    const scopedOrdersForAgg = () => {
      let q = supabase
        .from("orders")
        .select("customer_email,total,created_at")
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5000);
      if (storeId) q = q.eq("store_id", storeId);
      return q;
    };
    const scopedRecentOrders = () => {
      let q = supabase
        .from("orders")
        .select("id,customer_name,total,status,created_at")
        .eq("store_owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (storeId) q = q.eq("store_id", storeId);
      return q;
    };

    Promise.all([scopedProducts(), scopedOrdersCount(), scopedOrdersForAgg(), scopedRecentOrders()])
      .then(async ([prodRes, ordersCountRes, ordersAggRes, recentRes]) => {
        if (cancelled) return;
        const agg = ordersAggRes.data ?? [];
        const revenue = agg.reduce((n, o) => n + Number(o.total ?? 0), 0);
        const customers = new Set(
          agg.map((o) => (o.customer_email ?? "").toLowerCase()).filter(Boolean),
        ).size;
        setCounts({
          products: prodRes.count ?? 0,
          orders: ordersCountRes.count ?? 0,
          revenue,
          customers,
        });

        const last7DaysOrders = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(Date.now() - (6 - i) * 86400000);
          const dayStr = day.toISOString().slice(0, 10);
          return agg.filter((o) => o.created_at?.slice(0, 10) === dayStr).length;
        });
        const last7DaysRevenue = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(Date.now() - (6 - i) * 86400000);
          const dayStr = day.toISOString().slice(0, 10);
          return agg
            .filter((o) => o.created_at?.slice(0, 10) === dayStr)
            .reduce((s, o) => s + Number(o.total ?? 0), 0);
        });
        setSparklineOrders(last7DaysOrders);
        setSparklineRevenue(last7DaysRevenue);

        const recent = recentRes.data ?? [];
        const recentIds = recent.map((o) => o.id);
        const itemsByOrder: Record<
          string,
          { product_name: string; image_url: string | null; count: number }
        > = {};
        if (recentIds.length) {
          const { data: its } = await supabase
            .from("order_items")
            .select("order_id,product_name,image_url")
            .in("order_id", recentIds);
          if (cancelled) return;
          for (const it of its ?? []) {
            const cur = itemsByOrder[it.order_id];
            if (cur) cur.count += 1;
            else
              itemsByOrder[it.order_id] = {
                product_name: it.product_name,
                image_url: it.image_url,
                count: 1,
              };
          }
        }
        setRecentOrders(
          recent.map((o) => ({
            id: o.id,
            customer_name: o.customer_name,
            total: Number(o.total),
            status: o.status,
            created_at: o.created_at,
            product_name: itemsByOrder[o.id]?.product_name ?? null,
            product_image: itemsByOrder[o.id]?.image_url ?? null,
            item_count: itemsByOrder[o.id]?.count ?? 0,
          })),
        );
      })
      .catch((err) => {
        if (!cancelled) console.error("Dashboard data load failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [user, currentStore?.id]);

  useEffect(() => {
    return loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) setGamiLoading(false);
        return;
      }
      try {
        const result = await callGami({
          data: { accessToken: session.access_token, storeId: currentStore?.id },
        });
        if (!cancelled) setGamiData(result);
      } catch {
        /* ignore */
      }
      if (!cancelled) setGamiLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [callGami, currentStore?.id]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      try {
        const result = await callZrBalance({ data: { accessToken: session.access_token } });
        if (!cancelled) setZrBalance(result);
      } catch {
        if (!cancelled) setZrBalance(null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [callZrBalance]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`dashboard-orders-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `store_owner_id=eq.${user.id}`,
        },
        () => loadDashboard(),
      )
      .subscribe();
    let lastFocusReload = Date.now();
    const onFocus = () => {
      if (Date.now() - lastFocusReload > 30_000) {
        lastFocusReload = Date.now();
        loadDashboard();
      }
    };
    window.addEventListener("focus", onFocus);
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", onFocus);
    };
  }, [user, loadDashboard]);

  const currency = currentStore?.currency ?? "DZD";

  const stats = useMemo(
    () => [
      {
        label: t("dashboard.home.stats.revenue"),
        raw: counts.revenue,
        isRevenue: true,
        icon: DollarSign,
        gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
        currency,
        sparklineData: sparklineRevenue,
        colSpan: "lg:col-span-2",
      },
      {
        label: t("dashboard.home.stats.orders"),
        raw: counts.orders,
        icon: ShoppingBag,
        gradient: "bg-gradient-to-br from-blue-500 to-indigo-500",
        sparklineData: sparklineOrders,
        colSpan: "",
      },
      {
        label: t("dashboard.home.stats.products"),
        raw: counts.products,
        icon: Package,
        gradient: "bg-gradient-to-br from-violet-500 to-fuchsia-500",
        colSpan: "",
      },
      {
        label: t("dashboard.home.stats.customers"),
        raw: counts.customers,
        icon: Users,
        gradient: "bg-gradient-to-br from-orange-400 to-amber-500",
        colSpan: "",
      },
    ],
    [t, counts.products, counts.orders, counts.revenue, counts.customers, currency, sparklineOrders, sparklineRevenue],
  );

  const displayName = name || user?.email?.split("@")[0] || "—";

  const checklistSteps = useMemo(() => {
    const storeNameSet = !!storeSettings?.store_name && storeSettings.store_name !== "My Store";
    const hasProducts = counts.products > 0;
    const hasPayments = !hasPendingPayment;
    const themeCustomized = !!storeSettings?.theme && storeSettings.theme !== "default";
    const storeLive = !!storeSettings?.is_active;

    const steps = [
      { key: "storeInfo", done: storeNameSet, current: !storeNameSet },
      { key: "products", done: hasProducts, current: storeNameSet && !hasProducts },
      { key: "payments", done: hasPayments, current: hasProducts && !hasPayments },
      { key: "customize", done: themeCustomized, current: hasPayments && !themeCustomized },
      { key: "launch", done: storeLive, current: themeCustomized && !storeLive },
    ];

    return steps.map((s) => {
      const titles: Record<string, { title: string; description: string }> = {
        storeInfo: {
          title: t("dashboard.home.checklistSteps.storeInfo.title"),
          description: t("dashboard.home.checklistSteps.storeInfo.desc"),
        },
        products: {
          title: t("dashboard.home.checklistSteps.products.title"),
          description: t("dashboard.home.checklistSteps.products.desc"),
        },
        payments: {
          title: t("dashboard.home.checklistSteps.payments.title"),
          description: t("dashboard.home.checklistSteps.payments.desc"),
        },
        customize: {
          title: t("dashboard.home.checklistSteps.customize.title"),
          description: t("dashboard.home.checklistSteps.customize.desc"),
        },
        launch: {
          title: t("dashboard.home.checklistSteps.launch.title"),
          description: t("dashboard.home.checklistSteps.launch.desc"),
        },
      };
      return { ...s, ...titles[s.key] };
    });
  }, [storeSettings, counts.products, hasPendingPayment, t]);

  return (
    <div className="max-w-7xl mx-auto space-y-5 pb-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 sm:p-8"
      >
        <div
          className="absolute inset-y-0 right-0 w-1/3 opacity-[0.03] dark:opacity-[0.06]"
          style={{ backgroundImage: "radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="absolute left-0 inset-y-0 w-1 rounded-l-2xl bg-gradient-to-b from-violet-500 via-fuchsia-500 to-violet-500" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pl-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
              {new Date().getHours() < 12 ? "☀️ Good morning" : new Date().getHours() < 18 ? "🌤️ Good afternoon" : "🌙 Good evening"}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {displayName} <span className="text-muted-foreground font-normal text-xl">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t("dashboard.home.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t("dashboard.home.storeActive")}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <WindowsAppBanner />
      <IphoneShortcutBanner />

      <SubscriptionStatusCard
        status={status}
        daysRemaining={daysRemaining}
        hadPaidSubscription={!!hadPaidSubscription}
        hasPendingPayment={hasPendingPayment}
      />

      {/* Stats */}
      {counts.products === 0 && counts.orders === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <EmptyState
            icon={Store}
            title="Welcome to your dashboard"
            description="Your store stats will show up here once you add products and start getting orders."
            action={{
              label: "Add your first product",
              onClick: () => navigate({ to: "/dashboard/products" }),
            }}
          />
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.06 * i }}
              className={s.colSpan}
            >
              <StatCard
                label={s.label}
                rawValue={s.raw}
                isRevenue={s.isRevenue}
                icon={s.icon}
                gradient={s.gradient}
                delay={i * 120}
                currency={s.currency}
                sparklineData={s.sparklineData}
              />
            </motion.div>
          ))}
        </div>
      )}

      <CodPendingWidget user={user} formatPrice={(n) => fmtPrice(n, currentStore?.currency ?? "DZD")} />

      {/* ZRExpress — Solde prêt (shown when the API responded, even on error) */}
      {zrBalance && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className={
            zrBalance.ok
              ? "relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-5 sm:p-6"
              : "relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 p-5 sm:p-6"
          }
        >
          {zrBalance.ok && zrBalance.readyBalance > 0 && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[80px] sm:text-[120px] font-bold text-emerald-500/[0.05] dark:text-emerald-400/[0.08] leading-none pointer-events-none select-none tabular-nums">
              {zrBalance.readyBalance.toLocaleString()}
            </div>
          )}
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={
                  zrBalance.ok
                    ? "h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white"
                    : "h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white"
                }
              >
                <Wallet className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div
                  className={
                    zrBalance.ok
                      ? "text-[11px] font-semibold uppercase tracking-widest text-emerald-600/80"
                      : "text-[11px] font-semibold uppercase tracking-widest text-amber-600/80"
                  }
                >
                  ZRExpress
                </div>
                <div className="text-sm font-medium text-muted-foreground">Solde prêt</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              {zrBalance.ok ? (
                <>
                  <div
                    className={
                      zrBalance.readyBalance > 0
                        ? "text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums"
                        : "text-2xl sm:text-3xl font-bold text-red-600 tabular-nums"
                    }
                  >
                    {zrBalance.readyBalance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {zrBalance.currency}
                  </div>
                </>
              ) : (
                <div className="text-2xl sm:text-3xl font-bold text-amber-700/70 tabular-nums">
                  —
                </div>
              )}
            </div>
          </div>
          {zrBalance.ok && zrBalance.readyBalance > 0 && (
            <div className="relative mt-3 flex items-center justify-between">
              <span className="text-xs text-emerald-600/80 font-medium">Ready to withdraw</span>
              <Button variant="outline" size="sm" asChild className="h-7 text-xs border-emerald-500/20 hover:bg-emerald-500/10">
                <Link to="/dashboard/shipments">
                  Withdraw <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          )}
          {!zrBalance.ok && (
            <div className="relative mt-3 text-xs text-amber-700/90 break-words">{zrBalance.message}</div>
          )}
          {zrBalance.ok && zrBalance.readyBalance === 0 && (
            <div className="relative mt-3 text-xs text-muted-foreground">No parcels have been delivered yet this period</div>
          )}
        </motion.div>
      )}

      {/* Store Setup + Quick Actions (left) | Your Progress + Store Preview (right) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        {/* LEFT COLUMN: Store Setup → Quick Actions */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <StoreProgressCard />
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.28 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{t("dashboard.home.shortcuts.title")}</h3>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {[
                    { to: "/dashboard/products", icon: Plus, gradient: "from-violet-500 to-fuchsia-500", label: t("dashboard.home.shortcuts.products") },
                    { to: "/dashboard/orders", icon: ShoppingBag, gradient: "from-blue-500 to-indigo-500", label: t("dashboard.home.shortcuts.orders") },
                    { to: "/dashboard/customers", icon: Users, gradient: "from-emerald-500 to-teal-500", label: t("dashboard.home.shortcuts.customers") },
                    { to: "/dashboard/analytics", icon: BarChart3, gradient: "from-sky-500 to-blue-600", label: t("dashboard.home.shortcuts.analytics") },
                    { to: "/dashboard/delivery", icon: Truck, gradient: "from-amber-500 to-orange-500", label: t("dashboard.home.shortcuts.delivery") },
                    { to: "/dashboard/voice-generator", icon: Mic, gradient: "from-rose-500 to-pink-500", label: t("dashboard.home.shortcuts.voiceGenerator") },
                  ].map((s) => (
                    <Link key={s.to} to={s.to as never} className="group block">
                      <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border/40 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] text-center">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300`}>
                          <s.icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-foreground">{s.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Your Progress → Store Preview */}
        <div className="md:col-span-1 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
          >
            {gamiLoading ? (
              <Card className="border-border/50 overflow-hidden">
                <CardContent className="p-5 animate-pulse space-y-3">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-2 bg-muted rounded w-full" />
                  <div className="h-2 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ) : gamiData ? (
              <GamificationHub data={gamiData} compact />
            ) : null}
          </motion.div>

          {/* Store Preview Card — live screenshot */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.32 }}
          >
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-sm">{t("dashboard.home.storePreview.title")}</h3>
                </div>
                {currentStore?.slug ? (
                  <>
                    {!screenshotLoaded && !screenshotError && (
                      <div className="animate-pulse rounded-lg bg-muted h-48 w-full" />
                    )}
                    {screenshotError ? (
                      <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
                        <Store className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-xs font-medium text-foreground">
                          {storeSettings?.store_name || currentStore?.slug}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">Preview unavailable</p>
                      </div>
                    ) : (
                      <img
                        src={`https://image.thum.io/get/width/600/crop/400/noanimate/https://fennecly.online/s/${currentStore.slug}`}
                        alt={storeSettings?.store_name || "Store preview"}
                        loading="lazy"
                        onLoad={() => setScreenshotLoaded(true)}
                        onError={() => setScreenshotError(true)}
                        className={`rounded-lg border border-border/30 w-full object-cover h-48 max-h-48 ${screenshotLoaded ? "block" : "hidden"}`}
                      />
                    )}
                  </>
                ) : (
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-6 text-center">
                    <Store className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Set up your store to see a preview</p>
                  </div>
                )}
                <Button variant="outline" size="sm" asChild className="w-full mt-3 gap-1.5">
                  <a
                    href={currentStore?.slug ? `https://fennecly.online/s/${currentStore.slug}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {t("dashboard.home.actions.viewStore.title")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Recent orders + Launch checklist */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                  <ShoppingBag className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{t("dashboard.home.recentOrders")}</h3>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-1.5 text-xs">
                <Link to="/dashboard/orders">
                  {t("dashboard.home.viewAllOrders")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-3 font-medium">{t("dashboard.home.noOrders")}</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                  {t("dashboard.home.noOrdersDesc")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 pb-3">
                      <th className="text-left text-xs font-semibold uppercase text-muted-foreground pb-3 pr-4" style={{ letterSpacing: "0.08em" }}>
                        {t("dashboard.home.tableHeaders.order")}
                      </th>
                      <th className="text-left text-xs font-semibold uppercase text-muted-foreground pb-3 pr-4 hidden sm:table-cell" style={{ letterSpacing: "0.08em" }}>
                        {t("dashboard.home.tableHeaders.customer")}
                      </th>
                      <th className="text-left text-xs font-semibold uppercase text-muted-foreground pb-3 pr-4 hidden md:table-cell" style={{ letterSpacing: "0.08em" }}>
                        {t("dashboard.home.tableHeaders.date")}
                      </th>
                      <th className="text-left text-xs font-semibold uppercase text-muted-foreground pb-3 pr-4" style={{ letterSpacing: "0.08em" }}>
                        {t("dashboard.home.tableHeaders.status")}
                      </th>
                      <th className="text-right text-xs font-semibold uppercase text-muted-foreground pb-3" style={{ letterSpacing: "0.08em" }}>
                        {t("dashboard.home.tableHeaders.amount")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => {
                      const createdDate = new Date(o.created_at);
                      return (
                        <tr
                          key={o.id}
                          className="border-b border-border/40 last:border-0 hover:bg-primary/3 transition-colors cursor-pointer"
                        >
                          <td className="py-4 pr-4">
                            <Link to="/dashboard/orders" className="flex items-center gap-3 min-w-0">
                              {o.product_image ? (
                                <Img
                                  src={o.product_image}
                                  alt={o.product_name ?? ""}
                                  width={96}
                                  quality={75}
                                  className="h-12 w-12 rounded-lg shrink-0 ring-1 ring-border/30 object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center shrink-0 ring-1 ring-border/30">
                                  <ShoppingBag className="h-4 w-4 text-violet-500" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {o.product_name ?? t("dashboard.home.unknownOrder")}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-mono truncate">
                                  #{o.id.slice(0, 8)}
                                </p>
                                <p className="text-xs text-muted-foreground truncate sm:hidden">
                                  {o.customer_name}
                                </p>
                              </div>
                            </Link>
                          </td>
                          <td className="py-4 pr-4 hidden sm:table-cell">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <User className="h-4 w-4 text-muted-foreground shrink-0" />
                              <span className="text-sm truncate">
                                {o.customer_name || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 pr-4 whitespace-nowrap hidden md:table-cell">
                            <div>
                              <p className="text-sm">{format(createdDate, "M/d/yyyy")}</p>
                              <p className="text-xs text-muted-foreground">{format(createdDate, "h:mm a")}</p>
                            </div>
                          </td>
                          <td className="py-4 pr-4">
                            <Badge
                              variant="outline"
                              className={`capitalize text-[11px] px-2 py-0.5 border gap-1.5 ${STATUS_COLORS[o.status] || "bg-muted text-muted-foreground border-border/50"}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT_COLORS[o.status] || "bg-muted-foreground"}`} />
                              {o.status}
                            </Badge>
                          </td>
                          <td className="py-4 text-right">
                            <span className={`font-semibold text-sm tabular-nums ${o.status === "delivered" ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                              {Number(o.total).toLocaleString()} {currency}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Launch Checklist */}
        <Card className="border-violet-200/50 dark:border-violet-800/30 bg-violet-50/30 dark:bg-violet-950/10 overflow-hidden">
          <CardContent className="p-5 sm:p-6 flex flex-col h-full">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <h3 className="mt-4 text-lg sm:text-xl font-bold font-display text-foreground flex items-center gap-1.5">
              {t("dashboard.home.checklist")}
              <Sparkles className="h-4 w-4 text-violet-500" />
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground/70">
              {t("dashboard.home.checklistDesc")}
            </p>
            <div className="mt-5 flex-1">
              {checklistSteps.map((step, idx) => {
                const isLast = idx === checklistSteps.length - 1;
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                          step.done
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : step.current
                              ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {step.done ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-semibold">{idx + 1}</span>
                        )}
                      </div>
                      {!isLast && (
                        <div className="w-px flex-1 border-l border-dashed border-border/60 my-1" />
                      )}
                    </div>
                    <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                      <p className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-foreground/80"}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Button size="sm" asChild className="w-full gap-1.5 bg-violet-600 hover:bg-violet-700 text-white">
                <Link to="/dashboard/store">
                  {t("dashboard.home.continueSetup")}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <InstalledAppsSection />
    </div>
  );
}

function StatCard({
  label,
  rawValue,
  isRevenue,
  icon: Icon,
  gradient,
  delay,
  currency = "DZD",
  sparklineData,
}: {
  label: string;
  rawValue: number;
  isRevenue?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  gradient?: string;
  delay: number;
  currency?: string;
  sparklineData?: number[];
}) {
  const animated = useCountUp(rawValue, 1400, delay);
  const display = isRevenue
    ? `${animated.toLocaleString()} ${currency}`
    : animated.toLocaleString();

  const isFilled = !!gradient;

  const sparkPoints = useMemo(() => {
    if (!sparklineData || sparklineData.length < 2) return "";
    const max = Math.max(...sparklineData, 1);
    return sparklineData
      .map((v, i) => {
        const x = (i / (sparklineData.length - 1)) * 100;
        const y = 100 - (v / max) * 100;
        return `${x},${y}`;
      })
      .join(" ");
  }, [sparklineData]);

  return (
    <Card
      className={
        isFilled
          ? `relative overflow-hidden border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${gradient}`
          : "relative overflow-hidden border-border/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
      }
    >
      {isFilled && (
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      )}
      {isRevenue && (
        <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <span
            className={
              isFilled
                ? "text-xs font-semibold uppercase tracking-wider text-white/80"
                : "text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {label}
          </span>
          <div
            className={
              isFilled
                ? "h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm text-white flex items-center justify-center"
                : "h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
            }
          >
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <div
            className={
              isFilled
                ? "text-2xl sm:text-3xl font-bold font-display tracking-tighter text-white"
                : "text-2xl sm:text-3xl font-bold font-display tracking-tighter"
            }
            style={{ fontFeatureSettings: '"tnum"' }}
          >
            {display}
          </div>
        </div>
        {sparkPoints && (
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-full mt-3">
            <polyline
              points={sparkPoints}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isFilled ? "text-white/50" : "text-primary"}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </CardContent>
    </Card>
  );
}

function SubscriptionStatusCard({
  status,
  daysRemaining,
  hadPaidSubscription,
  hasPendingPayment,
}: {
  status: string;
  daysRemaining: number;
  hadPaidSubscription: boolean;
  hasPendingPayment: boolean;
}) {
  const { t } = useTranslation();

  if (status === "active") {
    return (
      <Card className="border-emerald-500/20 overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t("dashboard.home.subActive")}</p>
              <p className="text-xs text-muted-foreground/70">
                {t("dashboard.home.subActiveDesc")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (hasPendingPayment) {
    return (
      <Card className="border-amber-500/20 overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{t("dashboard.home.subPending")}</p>
              <p className="text-xs text-muted-foreground/70">
                {t("dashboard.home.subPendingDesc")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-amber-500/20 hover:bg-amber-500/10"
          >
            <Link to="/dashboard/upgrade">{t("dashboard.home.viewStatus")}</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "expired") {
    const title = hadPaidSubscription
      ? t("dashboard.home.subExpired")
      : t("dashboard.home.trialExpired");
    const desc = hadPaidSubscription
      ? t("dashboard.home.subExpiredDesc")
      : t("dashboard.home.trialExpiredDesc");
    const cta = hadPaidSubscription ? t("dashboard.home.renew") : t("dashboard.home.upgradeNow");
    return (
      <Card className="border-red-500/20 overflow-hidden">
        <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 ring-1 ring-red-500/20">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground/70">{desc}</p>
            </div>
          </div>
          <Button size="sm" asChild variant="destructive">
            <Link to="/dashboard/upgrade">
              <Sparkles className="size-3.5 mr-1" />
              {cta}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">
              {t("dashboard.home.trialLeft", {
                days: daysRemaining,
                unit: daysRemaining === 1 ? t("dashboard.home.day") : t("dashboard.home.days"),
              })}
            </p>
            <p className="text-xs text-muted-foreground/70">{t("dashboard.home.trialDesc")}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          asChild
          className="border-primary/20 hover:bg-primary/10"
        >
          <Link to="/dashboard/upgrade">{t("dashboard.home.upgrade")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function CodPendingWidget({
  user,
  formatPrice,
}: {
  user: { id: string } | null;
  formatPrice: (n: number) => string;
}) {
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("cod_collections")
      .select("amount, status")
      .eq("merchant_id", user.id)
      .then(({ data }) => {
        if (!data) return setLoaded(true);
        const pending = data
          .filter((c) => c.status === "in_transit" || c.status === "delivered")
          .reduce((s, c) => s + (c.amount || 0), 0);
        setTotal(pending);
        setLoaded(true);
      });
  }, [user]);

  if (!loaded || total === 0) return null;

  return (
    <Link to="/dashboard/apps/cod-manager" className="block">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-red-500/10 p-4 sm:p-5 flex items-center justify-between gap-4 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-amber-600/80 font-semibold uppercase tracking-wider">COD Pending</p>
            <p className="text-lg font-bold tabular-nums">{formatPrice(total)}</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
          في الطريق
        </Badge>
      </motion.div>
    </Link>
  );
}
