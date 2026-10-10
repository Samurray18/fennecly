import { supabase } from "@/integrations/supabase/client";
import type {
  ProfitExpense,
  ProfitOrder,
  ProfitOrderCost,
  ProfitOrderItem,
  ProfitProductCost,
  ProfitReturn,
} from "./compute";

/** Inclusive date range, "YYYY-MM-DD". */
export type ProfitRange = { from: string; to: string };

export type ProfitData = {
  orders: ProfitOrder[];
  orderItems: ProfitOrderItem[];
  productCosts: ProfitProductCost[];
  orderCosts: ProfitOrderCost[];
  returns: ProfitReturn[];
  expenses: ProfitExpense[];
  /** The range actually used, after clamping. */
  range: ProfitRange;
};

const MAX_RANGE_DAYS = 366;
const PAGE_SIZE = 1000;
const ID_CHUNK = 150;

type RowResult<T> = { data: T[] | null; error: { message: string } | null };

function parseDay(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec((value ?? "").trim());
  if (!m) throw new Error(`Invalid date: ${value}`);
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`);
  return d;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(key: string): Date {
  const d = parseDay(key);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function endOfDay(key: string): Date {
  const d = parseDay(key);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

/** Normalize + cap a range so a single query can never scan more than 366 days. */
export function clampRange(from: string, to: string): ProfitRange {
  let start = parseDay(from);
  let end = parseDay(to);
  if (start.getTime() > end.getTime()) {
    const tmp = start;
    start = end;
    end = tmp;
  }
  const diffDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  if (diffDays > MAX_RANGE_DAYS - 1) {
    start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - (MAX_RANGE_DAYS - 1));
  }
  return { from: localDateKey(start), to: localDateKey(end) };
}

/** Page through a PostgREST query in 1000-row windows until exhausted. */
async function paged<T>(make: (from: number, to: number) => PromiseLike<RowResult<T>>): Promise<T[]> {
  const out: T[] = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data, error } = await make(start, start + PAGE_SIZE - 1);
    if (error) throw new Error(error.message || "Failed to load profit data.");
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    if (start > 500 * PAGE_SIZE) break; // safety valve
  }
  return out;
}

/**
 * Load every private cost input for a store + date range using the caller's
 * normal (RLS-scoped) session. Never uses the service role.
 */
export async function loadProfitData(params: {
  storeId: string;
  ownerId: string;
  from: string;
  to: string;
}): Promise<ProfitData> {
  const { storeId, ownerId } = params;
  const range = clampRange(params.from, params.to);
  const startIso = startOfDay(range.from).toISOString();
  const endIso = endOfDay(range.to).toISOString();

  const orders = await paged<ProfitOrder>((from, to) =>
    supabase
      .from("orders")
      .select("id, status, total, created_at, customer_name")
      .eq("store_id", storeId)
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .range(from, to),
  );

  const orderIds = orders.map((o) => o.id);
  const idSet = new Set(orderIds);

  const productCosts = await paged<ProfitProductCost>((from, to) =>
    supabase
      .from("product_costs")
      .select("product_id, cost_price")
      .eq("owner_id", ownerId)
      .range(from, to),
  );

  const orderCostsAll = await paged<ProfitOrderCost>((from, to) =>
    supabase
      .from("order_costs")
      .select("order_id, delivery_cost, return_cost")
      .eq("store_id", storeId)
      .range(from, to),
  );
  const orderCosts = orderCostsAll.filter((c) => idSet.has(c.order_id));

  const orderItems: ProfitOrderItem[] = [];
  for (const ids of chunk(orderIds, ID_CHUNK)) {
    const rows = await paged<ProfitOrderItem>((from, to) =>
      supabase
        .from("order_items")
        .select("order_id, product_id, product_name, quantity, unit_price")
        .in("order_id", ids)
        .range(from, to),
    );
    orderItems.push(...rows);
  }

  const returns: ProfitReturn[] = [];
  for (const ids of chunk(orderIds, ID_CHUNK)) {
    const rows = await paged<ProfitReturn>((from, to) =>
      supabase
        .from("returns")
        .select("order_id, status, refund_amount")
        .eq("store_owner_id", ownerId)
        .in("order_id", ids)
        .range(from, to),
    );
    returns.push(...rows);
  }

  const expenses = await paged<ProfitExpense>((from, to) =>
    supabase
      .from("expenses")
      .select("expense_date, amount")
      .eq("store_id", storeId)
      .gte("expense_date", range.from)
      .lte("expense_date", range.to)
      .range(from, to),
  );

  return {
    orders,
    orderItems,
    productCosts,
    orderCosts,
    returns,
    expenses,
    range,
  };
}

export const EXPENSE_CATEGORIES = [
  "ads",
  "packaging",
  "salary",
  "rent",
  "software",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** Insert an expense with the caller's normal (RLS-scoped) session. */
export async function addExpense(input: {
  ownerId: string;
  storeId: string;
  expenseDate: string;
  category: ExpenseCategory;
  amount: number;
  note?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("expenses").insert({
    owner_id: input.ownerId,
    store_id: input.storeId,
    expense_date: input.expenseDate,
    category: input.category,
    amount: input.amount,
    note: input.note?.trim() ? input.note.trim() : null,
  });
  if (error) throw new Error(error.message || "Failed to add expense.");
}

/** Delete an expense owned by the caller. */
export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw new Error(error.message || "Failed to delete expense.");
}

/** Full expense rows (with id) for the expenses list in the period. */
export type ExpenseRow = {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  note: string | null;
};

export async function loadExpenses(params: {
  storeId: string;
  from: string;
  to: string;
}): Promise<ExpenseRow[]> {
  const range = clampRange(params.from, params.to);
  return paged<ExpenseRow>((from, to) =>
    supabase
      .from("expenses")
      .select("id, expense_date, category, amount, note")
      .eq("store_id", params.storeId)
      .gte("expense_date", range.from)
      .lte("expense_date", range.to)
      .order("expense_date", { ascending: false })
      .range(from, to),
  );
}
