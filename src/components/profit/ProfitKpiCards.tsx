import { useTranslation } from "react-i18next";
import {
  Banknote,
  Clock,
  Package,
  Percent,
  Receipt,
  TrendingUp,
  Truck,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";
import type { ProfitTotals } from "@/lib/profit/compute";

type Kpi = { label: string; value: string; gradient: string; icon: LucideIcon };

function KpiCard({ kpi }: { kpi: Kpi }) {
  const Icon = kpi.icon;
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-0 bg-gradient-to-br text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        kpi.gradient,
      )}
    >
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/15 blur-2xl" />
      <CardContent className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            {kpi.label}
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 font-display text-2xl font-bold tabular-nums text-white">
          {kpi.value}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfitKpiCards({ totals }: { totals: ProfitTotals }) {
  const { t } = useTranslation();
  const net = totals.netProfit;

  const cards: Kpi[] = [
    {
      label: t("dashboard.profit.kpi.revenue"),
      value: formatPrice(totals.revenue),
      gradient: "from-sky-500 to-indigo-500",
      icon: TrendingUp,
    },
    {
      label: t("dashboard.profit.kpi.cogs"),
      value: formatPrice(totals.costOfGoods),
      gradient: "from-amber-500 to-orange-500",
      icon: Package,
    },
    {
      label: t("dashboard.profit.kpi.deliveryCosts"),
      value: formatPrice(totals.deliveryCosts),
      gradient: "from-cyan-500 to-blue-500",
      icon: Truck,
    },
    {
      label: t("dashboard.profit.kpi.returnLosses"),
      value: formatPrice(totals.returnLosses),
      gradient: "from-rose-500 to-pink-500",
      icon: Undo2,
    },
    {
      label: t("dashboard.profit.kpi.expenses"),
      value: formatPrice(totals.expenses),
      gradient: "from-fuchsia-500 to-purple-500",
      icon: Receipt,
    },
    {
      label: t("dashboard.profit.kpi.margin"),
      value: `${totals.marginPercent.toFixed(1)}%`,
      gradient: "from-violet-500 to-purple-600",
      icon: Percent,
    },
    {
      label: t("dashboard.profit.kpi.pipeline"),
      value: formatPrice(totals.pipelineValue),
      gradient: "from-slate-500 to-slate-700",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-4">
      <Card
        className={cn(
          "relative overflow-hidden border-0 text-white shadow-lg bg-gradient-to-br",
          net >= 0
            ? "from-emerald-500 via-teal-500 to-cyan-600"
            : "from-rose-500 via-red-500 to-orange-500",
        )}
      >
        <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/85">
              {t("dashboard.profit.kpi.netProfit")}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Banknote className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-display text-4xl font-bold tabular-nums">
            {formatPrice(net)}
          </div>
          <p className="mt-2 text-xs text-white/80">{t("dashboard.profit.kpi.netProfitHint")}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((kpi) => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
