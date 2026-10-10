import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";
import type { ProfitPerOrder, StatusClass } from "@/lib/profit/compute";

const PAGE_SIZE = 20;

const CLASS_BADGE: Record<StatusClass, string> = {
  delivered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  returned: "border-rose-500/40 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  cancelled: "border-slate-500/40 bg-slate-500/10 text-slate-600 dark:text-slate-400",
  pipeline: "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400",
  unknown: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function ProfitByOrderTable({
  rows,
  customerNameById,
}: {
  rows: ProfitPerOrder[];
  customerNameById: Map<string, string>;
}) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [rows]);

  if (rows.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {t("dashboard.profit.empty")}
        </CardContent>
      </Card>
    );
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.profit.byOrderCols.order")}</TableHead>
                <TableHead>{t("dashboard.profit.byOrderCols.status")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byOrderCols.revenue")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byOrderCols.cost")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byOrderCols.delivery")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byOrderCols.profit")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((o) => {
                const customer = customerNameById.get(o.orderId);
                return (
                  <TableRow key={o.orderId}>
                    <TableCell className="max-w-[220px]">
                      <div className="font-mono text-xs text-muted-foreground">
                        #{o.orderId.slice(0, 8)}
                      </div>
                      {customer && <div className="truncate text-sm">{customer}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("whitespace-nowrap", CLASS_BADGE[o.class])}
                      >
                        {t(`dashboard.profit.status.${o.class}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">{formatPrice(o.revenue)}</TableCell>
                    <TableCell className="text-end tabular-nums">{formatPrice(o.cogs)}</TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatPrice(o.deliveryCost)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-end font-semibold tabular-nums",
                        o.profit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {formatPrice(o.profit)}
                      {o.missingCost && <span className="ms-1 text-amber-500">*</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              {t("dashboard.profit.pagination", {
                from: start + 1,
                to: Math.min(start + PAGE_SIZE, rows.length),
                total: rows.length,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">{t("dashboard.profit.previous")}</span>
              </Button>
              <span className="text-xs tabular-nums text-muted-foreground">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">{t("dashboard.profit.next")}</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
