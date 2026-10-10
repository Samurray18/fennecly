import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProfitWarnings } from "@/lib/profit/compute";

type WarningActionTo = "/dashboard/orders" | "/dashboard/products";

function WarningBanner({
  title,
  body,
  chips,
  actionTo,
  actionLabel,
}: {
  title: string;
  body: string;
  chips?: string[];
  actionTo?: WarningActionTo;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{body}</p>
          {chips && chips.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {chips.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-background px-2 py-0.5 text-[11px] text-foreground ring-1 ring-border"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {actionTo && actionLabel && (
        <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5 self-start">
          <Link to={actionTo}>
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      )}
    </div>
  );
}

export function ProfitWarnings({ warnings }: { warnings: ProfitWarnings }) {
  const { t } = useTranslation();
  const banners: ReactNode[] = [];

  if (warnings.deliveredOrdersMissingDeliveryCost > 0) {
    banners.push(
      <WarningBanner
        key="delivery"
        title={t("dashboard.profit.warnings.missingDeliveryTitle")}
        body={t("dashboard.profit.warnings.missingDeliveryBody", {
          count: warnings.deliveredOrdersMissingDeliveryCost,
        })}
        actionTo="/dashboard/orders"
        actionLabel={t("dashboard.profit.warnings.goToOrders")}
      />,
    );
  }

  if (warnings.deliveredOrdersMissingProductCost > 0) {
    banners.push(
      <WarningBanner
        key="product"
        title={t("dashboard.profit.warnings.missingProductTitle")}
        body={t("dashboard.profit.warnings.missingProductBody", {
          count: warnings.deliveredOrdersMissingProductCost,
        })}
        chips={warnings.productsMissingCost.slice(0, 6)}
        actionTo="/dashboard/products"
        actionLabel={t("dashboard.profit.warnings.goToProducts")}
      />,
    );
  }

  if (warnings.unknownStatusOrders.count > 0) {
    banners.push(
      <WarningBanner
        key="unknown"
        title={t("dashboard.profit.warnings.unknownStatusTitle")}
        body={t("dashboard.profit.warnings.unknownStatusBody", {
          count: warnings.unknownStatusOrders.count,
        })}
        chips={warnings.unknownStatusOrders.statuses.slice(0, 6)}
      />,
    );
  }

  if (banners.length === 0) return null;
  return <div className="space-y-3">{banners}</div>;
}
