import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatPrice";
import type { ProfitByProduct } from "@/lib/profit/compute";

export function ProfitByProductTable({ rows }: { rows: ProfitByProduct[] }) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          {t("dashboard.profit.empty")}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("dashboard.profit.byProductCols.product")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byProductCols.units")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byProductCols.revenue")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byProductCols.cost")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byProductCols.profit")}</TableHead>
                <TableHead className="text-end">{t("dashboard.profit.byProductCols.margin")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.productId ?? `name:${p.name}`}>
                  <TableCell className="max-w-[240px]">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{p.name}</span>
                      {!p.hasCost && (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                        >
                          {t("dashboard.profit.byProductCols.costMissing")}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{p.unitsSold}</TableCell>
                  <TableCell className="text-end tabular-nums">{formatPrice(p.revenue)}</TableCell>
                  <TableCell className="text-end tabular-nums">{formatPrice(p.cost)}</TableCell>
                  <TableCell
                    className={cn(
                      "text-end font-semibold tabular-nums",
                      p.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400",
                    )}
                  >
                    {formatPrice(p.profit)}
                  </TableCell>
                  <TableCell className="text-end tabular-nums">{p.marginPercent.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
