import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Wallet } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentStore } from "@/hooks/use-current-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeProfit } from "@/lib/profit/compute";
import {
  addExpense,
  deleteExpense,
  loadExpenses,
  loadProfitData,
  type ExpenseRow,
  type ProfitData,
} from "@/lib/profit/queries";
import { presetRange, type RangeValue } from "@/lib/profit/range";
import { ProfitRangeToolbar } from "@/components/profit/ProfitRangeToolbar";
import { ProfitKpiCards } from "@/components/profit/ProfitKpiCards";
import { ProfitWarnings } from "@/components/profit/ProfitWarnings";
import { ProfitChart } from "@/components/profit/ProfitChart";
import { ProfitByProductTable } from "@/components/profit/ProfitByProductTable";
import { ProfitByOrderTable } from "@/components/profit/ProfitByOrderTable";
import { ExpensesCard, type ExpenseInput } from "@/components/profit/ExpensesCard";

export const Route = createFileRoute("/dashboard/profit")({
  component: ProfitPage,
  head: () => ({ meta: [{ title: "Profit — Fennecly" }] }),
});

function ProfitPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentStore } = useCurrentStore();

  const [range, setRange] = useState<RangeValue>(() => ({
    preset: "thisMonth",
    ...presetRange("thisMonth"),
  }));
  const [data, setData] = useState<ProfitData | null>(null);
  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    if (!user || !currentStore) return;
    try {
      setLoading(true);
      setLoadError(false);
      const [profitData, expenses] = await Promise.all([
        loadProfitData({
          storeId: currentStore.id,
          ownerId: user.id,
          from: range.from,
          to: range.to,
        }),
        loadExpenses({ storeId: currentStore.id, from: range.from, to: range.to }),
      ]);
      setData(profitData);
      setExpenseRows(expenses);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, [user, currentStore, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  const result = useMemo(
    () =>
      data
        ? computeProfit({
            orders: data.orders,
            orderItems: data.orderItems,
            productCosts: data.productCosts,
            orderCosts: data.orderCosts,
            returns: data.returns,
            expenses: data.expenses,
            from: data.range.from,
            to: data.range.to,
          })
        : null,
    [data],
  );

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const o of data?.orders ?? []) {
      const name = o.customer_name?.trim();
      if (name) map.set(o.id, name);
    }
    return map;
  }, [data]);

  const handleAdd = async (input: ExpenseInput) => {
    if (!user || !currentStore) return;
    await addExpense({ ownerId: user.id, storeId: currentStore.id, ...input });
    toast.success(t("dashboard.profit.expenses.added"));
    await load();
  };

  const handleDelete = async (id: string) => {
    await deleteExpense(id);
    toast.success(t("dashboard.profit.expenses.deleted"));
    await load();
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-7xl items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (loadError || !result) {
    return (
      <div className="mx-auto max-w-7xl py-24 text-center">
        <p className="mb-4 text-muted-foreground">{t("dashboard.profit.loadFailed")}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="text-sm underline hover:no-underline"
        >
          {t("dashboard.profit.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        eyebrow={t("dashboard.profit.eyebrow")}
        title={t("dashboard.profit.title")}
        description={t("dashboard.profit.description")}
        icon={Wallet}
        gradient="from-emerald-500 via-teal-500 to-cyan-500"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ProfitRangeToolbar value={range} onChange={setRange} />
        <span className="text-xs text-muted-foreground">
          {t("dashboard.profit.dateFootnote")}
        </span>
      </div>

      <ProfitKpiCards totals={result.totals} />
      <ProfitWarnings warnings={result.warnings} />
      <ProfitChart data={result.daily} />

      <Tabs defaultValue="byProduct">
        <TabsList>
          <TabsTrigger value="byProduct">{t("dashboard.profit.tabs.byProduct")}</TabsTrigger>
          <TabsTrigger value="byOrder">{t("dashboard.profit.tabs.byOrder")}</TabsTrigger>
        </TabsList>
        <TabsContent value="byProduct" className="mt-4">
          <ProfitByProductTable rows={result.byProduct} />
        </TabsContent>
        <TabsContent value="byOrder" className="mt-4">
          <ProfitByOrderTable rows={result.perOrder} customerNameById={customerNameById} />
        </TabsContent>
      </Tabs>

      <ExpensesCard rows={expenseRows} onAdd={handleAdd} onDelete={handleDelete} />
    </div>
  );
}
