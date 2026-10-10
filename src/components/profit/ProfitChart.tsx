import { useTranslation } from "react-i18next";
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatPrice";
import type { ProfitDay } from "@/lib/profit/compute";

const POSITIVE = "#10B981";
const NEGATIVE = "#F43F5E";
const REVENUE = "#7C3AED";

export function ProfitChart({ data }: { data: ProfitDay[] }) {
  const { t } = useTranslation();
  const hasData = data.some((d) => d.revenue !== 0 || d.netProfit !== 0);

  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="mb-6">
          <h3 className="text-base font-semibold">{t("dashboard.profit.chart.title")}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t("dashboard.profit.chart.description")}
          </p>
        </div>

        {hasData ? (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                tickFormatter={(value: string) =>
                  new Date(value).toLocaleDateString("fr-DZ", { day: "numeric", month: "short" })
                }
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                width={50}
                tickFormatter={(v: number) =>
                  Math.abs(v) >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--popover-foreground))",
                }}
                formatter={(value, name) => [
                  formatPrice(Number(value)),
                  name === "netProfit"
                    ? t("dashboard.profit.chart.netProfit")
                    : t("dashboard.profit.chart.revenue"),
                ]}
                labelFormatter={(label) =>
                  new Date(String(label)).toLocaleDateString("fr-DZ", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })
                }
              />
              <Legend
                formatter={(value) =>
                  value === "netProfit"
                    ? t("dashboard.profit.chart.netProfit")
                    : t("dashboard.profit.chart.revenue")
                }
                wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
              />
              <Bar dataKey="netProfit" radius={[3, 3, 0, 0]} maxBarSize={28}>
                {data.map((d) => (
                  <Cell key={d.date} fill={d.netProfit >= 0 ? POSITIVE : NEGATIVE} />
                ))}
              </Bar>
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={REVENUE}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: REVENUE }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{t("dashboard.profit.empty")}</p>
            <p className="text-xs text-muted-foreground/70">{t("dashboard.profit.emptyHint")}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
