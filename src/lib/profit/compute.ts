/**
 * Pure profit calculation module.
 *
 * No React or Supabase imports — this is the single source of truth for how
 * private cost data (product_costs / order_costs / expenses) turns into the
 * numbers shown on the Profit dashboard. Kept dependency-free so it is easy to
 * unit-test.
 */

export type StatusClass = "delivered" | "returned" | "cancelled" | "pipeline" | "unknown";

export type ProfitOrder = {
  id: string;
  status: string | null;
  total: number | string | null;
  created_at: string;
  /** Optional display-only field; not used by the calculation. */
  customer_name?: string | null;
};

export type ProfitOrderItem = {
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number | string | null;
  unit_price: number | string | null;
};

export type ProfitProductCost = {
  product_id: string;
  cost_price: number | string | null;
};

export type ProfitOrderCost = {
  order_id: string;
  delivery_cost: number | string | null;
  return_cost: number | string | null;
};

export type ProfitReturn = {
  order_id: string;
  status: string | null;
  refund_amount: number | string | null;
};

export type ProfitExpense = {
  expense_date: string;
  amount: number | string | null;
};

export type ProfitInput = {
  orders: ProfitOrder[];
  orderItems: ProfitOrderItem[];
  productCosts: ProfitProductCost[];
  orderCosts: ProfitOrderCost[];
  returns: ProfitReturn[];
  expenses: ProfitExpense[];
  /** Inclusive range, "YYYY-MM-DD". */
  from: string;
  /** Inclusive range, "YYYY-MM-DD". */
  to: string;
};

export type ProfitCounts = {
  delivered: number;
  returned: number;
  cancelled: number;
  pipeline: number;
  unknown: number;
};

export type ProfitTotals = {
  revenue: number;
  refunds: number;
  costOfGoods: number;
  deliveryCosts: number;
  returnLosses: number;
  expenses: number;
  netProfit: number;
  marginPercent: number;
  pipelineValue: number;
  counts: ProfitCounts;
};

export type ProfitDay = {
  date: string;
  revenue: number;
  netProfit: number;
};

export type ProfitByProduct = {
  productId: string | null;
  name: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  hasCost: boolean;
};

export type ProfitPerOrder = {
  orderId: string;
  class: StatusClass;
  revenue: number;
  cogs: number;
  deliveryCost: number;
  returnCost: number;
  refund: number;
  profit: number;
  missingCost: boolean;
};

export type ProfitWarnings = {
  deliveredOrdersMissingProductCost: number;
  productsMissingCost: string[];
  deliveredOrdersMissingDeliveryCost: number;
  unknownStatusOrders: { count: number; statuses: string[] };
};

export type ProfitResult = {
  totals: ProfitTotals;
  daily: ProfitDay[];
  byProduct: ProfitByProduct[];
  perOrder: ProfitPerOrder[];
  warnings: ProfitWarnings;
};

/**
 * Status vocabulary. The dashboard's own statuses are the English ones below;
 * orders imported from ZR Express store the provider's free-text status
 * (lowercased by the importer), which is usually French. We only map the
 * unambiguous equivalents called out below — anything else is "unknown" and is
 * surfaced as a warning rather than silently guessed.
 */
const DELIVERED_STATUSES = new Set(["delivered", "livre", "livree"]);
const RETURNED_STATUSES = new Set([
  "returned",
  "retour",
  "retourne",
  "retournee",
  "refuse",
  "refusee",
  "refused",
]);
const CANCELLED_STATUSES = new Set(["cancelled", "canceled", "annule", "annulee"]);
const PIPELINE_STATUSES = new Set(["pending", "confirmed", "shipped"]);

/** Lowercase, trim and strip diacritics so "Livré" / "livre" collapse. */
function normalizeStatus(status: string | null): string {
  if (status == null) return "";
  return status
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function classifyStatus(status: string | null): StatusClass {
  const s = normalizeStatus(status);
  if (!s) return "unknown";
  if (PIPELINE_STATUSES.has(s)) return "pipeline";
  if (DELIVERED_STATUSES.has(s)) return "delivered";
  if (RETURNED_STATUSES.has(s)) return "returned";
  if (CANCELLED_STATUSES.has(s)) return "cancelled";
  return "unknown";
}

function num(v: number | string | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Round to 2 decimals, never returning -0 or NaN. */
function round2(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100) / 100 || 0;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local calendar date (YYYY-MM-DD) of an ISO timestamp, or null if invalid. */
function dateKeyFromIso(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return localDateKey(d);
}

/** Parse the leading YYYY-MM-DD of a string into a local Date, or null. */
function parseDay(value: string | null | undefined): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function eachDay(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  let guard = 0;
  while (cur.getTime() <= end.getTime() && guard < 400) {
    out.push(localDateKey(cur));
    cur.setDate(cur.getDate() + 1);
    guard += 1;
  }
  return out;
}

export function computeProfit(input: ProfitInput): ProfitResult {
  const emptyCounts: ProfitCounts = {
    delivered: 0,
    returned: 0,
    cancelled: 0,
    pipeline: 0,
    unknown: 0,
  };

  const fromDate = parseDay(input.from);
  const toDate = parseDay(input.to);
  const fromKey = fromDate ? localDateKey(fromDate) : null;
  const toKey = toDate ? localDateKey(toDate) : null;

  const inRange = (key: string | null): boolean => {
    if (key == null) return false;
    if (fromKey != null && key < fromKey) return false;
    if (toKey != null && key > toKey) return false;
    return true;
  };

  // Index lookups.
  const costMap = new Map<string, number>();
  for (const c of input.productCosts) costMap.set(c.product_id, num(c.cost_price));

  const orderCostMap = new Map<string, { delivery: number; ret: number }>();
  for (const c of input.orderCosts) {
    orderCostMap.set(c.order_id, { delivery: num(c.delivery_cost), ret: num(c.return_cost) });
  }

  const refundMap = new Map<string, number>();
  for (const r of input.returns) {
    if ((r.status ?? "").trim().toLowerCase() !== "approved") continue;
    refundMap.set(r.order_id, (refundMap.get(r.order_id) ?? 0) + num(r.refund_amount));
  }

  const itemsByOrder = new Map<string, ProfitOrderItem[]>();
  for (const it of input.orderItems) {
    const list = itemsByOrder.get(it.order_id);
    if (list) list.push(it);
    else itemsByOrder.set(it.order_id, [it]);
  }

  const counts: ProfitCounts = { ...emptyCounts };
  const perOrder: ProfitPerOrder[] = [];
  const productAgg = new Map<string, ProfitByProduct>();
  const missingCostNames = new Set<string>();

  const dayRevenue = new Map<string, number>();
  const dayNet = new Map<string, number>();
  const bumpRevenue = (key: string, v: number) =>
    dayRevenue.set(key, (dayRevenue.get(key) ?? 0) + v);
  const bumpNet = (key: string, v: number) => dayNet.set(key, (dayNet.get(key) ?? 0) + v);

  let revenue = 0;
  let refunds = 0;
  let costOfGoods = 0;
  let deliveryCosts = 0;
  let returnLosses = 0;
  let pipelineValue = 0;
  let deliveredOrdersMissingProductCost = 0;
  let deliveredOrdersMissingDeliveryCost = 0;
  const unknownStatuses = new Set<string>();

  for (const order of input.orders) {
    const key = dateKeyFromIso(order.created_at);
    if (!inRange(key)) continue;
    const cls = classifyStatus(order.status);
    counts[cls] += 1;
    const dayKey = key as string;

    if (cls === "delivered") {
      const rev = num(order.total);
      const items = itemsByOrder.get(order.id) ?? [];
      let cogs = 0;
      let missingItemCost = false;
      for (const it of items) {
        const qty = num(it.quantity);
        const unit = num(it.unit_price);
        const hasCost = it.product_id != null && costMap.has(it.product_id);
        const unitCost = hasCost ? (costMap.get(it.product_id as string) as number) : 0;
        if (!hasCost) {
          missingItemCost = true;
          missingCostNames.add(it.product_name);
        }
        cogs += qty * unitCost;

        const aggKey = it.product_id ?? `name:${it.product_name}`;
        const agg =
          productAgg.get(aggKey) ??
          ({
            productId: it.product_id,
            name: it.product_name,
            unitsSold: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
            marginPercent: 0,
            hasCost: false,
          } satisfies ProfitByProduct);
        agg.unitsSold += qty;
        agg.revenue += qty * unit;
        agg.cost += qty * unitCost;
        if (hasCost) agg.hasCost = true;
        if (!agg.name && it.product_name) agg.name = it.product_name;
        productAgg.set(aggKey, agg);
      }

      const oc = orderCostMap.get(order.id);
      const delivery = oc?.delivery ?? 0;
      const refund = refundMap.get(order.id) ?? 0;
      const profit = rev - refund - cogs - delivery;

      revenue += rev;
      refunds += refund;
      costOfGoods += cogs;
      deliveryCosts += delivery;

      if (missingItemCost) deliveredOrdersMissingProductCost += 1;
      if (!oc || delivery === 0) deliveredOrdersMissingDeliveryCost += 1;

      bumpRevenue(dayKey, rev);
      bumpNet(dayKey, profit);

      perOrder.push({
        orderId: order.id,
        class: cls,
        revenue: round2(rev),
        cogs: round2(cogs),
        deliveryCost: round2(delivery),
        returnCost: 0,
        refund: round2(refund),
        profit: round2(profit),
        missingCost: missingItemCost,
      });
    } else if (cls === "returned") {
      const oc = orderCostMap.get(order.id);
      const delivery = oc?.delivery ?? 0;
      const ret = oc?.ret ?? 0;
      const loss = delivery + ret;
      returnLosses += loss;
      bumpNet(dayKey, -loss);
      perOrder.push({
        orderId: order.id,
        class: cls,
        revenue: 0,
        cogs: 0,
        deliveryCost: round2(delivery),
        returnCost: round2(ret),
        refund: 0,
        profit: round2(-loss),
        missingCost: false,
      });
    } else if (cls === "pipeline") {
      pipelineValue += num(order.total);
      perOrder.push({
        orderId: order.id,
        class: cls,
        revenue: 0,
        cogs: 0,
        deliveryCost: 0,
        returnCost: 0,
        refund: 0,
        profit: 0,
        missingCost: false,
      });
    } else if (cls === "cancelled") {
      perOrder.push({
        orderId: order.id,
        class: cls,
        revenue: 0,
        cogs: 0,
        deliveryCost: 0,
        returnCost: 0,
        refund: 0,
        profit: 0,
        missingCost: false,
      });
    } else {
      unknownStatuses.add((order.status ?? "").trim() || "(none)");
      perOrder.push({
        orderId: order.id,
        class: cls,
        revenue: 0,
        cogs: 0,
        deliveryCost: 0,
        returnCost: 0,
        refund: 0,
        profit: 0,
        missingCost: false,
      });
    }
  }

  // Expenses are attributed to their own expense_date.
  let expenses = 0;
  for (const e of input.expenses) {
    const key = parseDay(e.expense_date) ? localDateKey(parseDay(e.expense_date) as Date) : null;
    if (!inRange(key)) continue;
    const amount = num(e.amount);
    expenses += amount;
    bumpNet(key as string, -amount);
  }

  const netProfit = revenue - refunds - costOfGoods - deliveryCosts - returnLosses - expenses;
  const marginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Build the daily series. Prefer a continuous range when from/to are valid,
  // otherwise fall back to the days that actually have data.
  let dayKeys: string[];
  if (fromDate && toDate) {
    dayKeys = eachDay(fromDate, toDate);
  } else {
    const all = new Set<string>([...dayRevenue.keys(), ...dayNet.keys()]);
    dayKeys = Array.from(all).sort();
  }
  const daily: ProfitDay[] = dayKeys.map((date) => ({
    date,
    revenue: round2(dayRevenue.get(date) ?? 0),
    netProfit: round2(dayNet.get(date) ?? 0),
  }));

  const byProduct: ProfitByProduct[] = Array.from(productAgg.values())
    .map((p) => {
      const profit = p.revenue - p.cost;
      return {
        productId: p.productId,
        name: p.name || "—",
        unitsSold: p.unitsSold,
        revenue: round2(p.revenue),
        cost: round2(p.cost),
        profit: round2(profit),
        marginPercent: p.revenue > 0 ? round2((profit / p.revenue) * 100) : 0,
        hasCost: p.hasCost,
      };
    })
    .sort((a, b) => b.profit - a.profit);

  const totals: ProfitTotals = {
    revenue: round2(revenue),
    refunds: round2(refunds),
    costOfGoods: round2(costOfGoods),
    deliveryCosts: round2(deliveryCosts),
    returnLosses: round2(returnLosses),
    expenses: round2(expenses),
    netProfit: round2(netProfit),
    marginPercent: round2(marginPercent),
    pipelineValue: round2(pipelineValue),
    counts,
  };

  const warnings: ProfitWarnings = {
    deliveredOrdersMissingProductCost,
    productsMissingCost: Array.from(missingCostNames).sort(),
    deliveredOrdersMissingDeliveryCost,
    unknownStatusOrders: {
      count: counts.unknown,
      statuses: Array.from(unknownStatuses).sort(),
    },
  };

  return { totals, daily, byProduct, perOrder, warnings };
}
