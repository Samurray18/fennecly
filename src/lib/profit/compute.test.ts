import { describe, expect, it } from "vitest";
import {
  classifyStatus,
  computeProfit,
  type ProfitInput,
  type ProfitOrder,
  type ProfitOrderItem,
} from "./compute";

/** Local noon ISO — avoids UTC/day-boundary flakiness across timezones. */
function at(y: number, m: number, d: number): string {
  return new Date(y, m - 1, d, 12, 0, 0).toISOString();
}

function order(id: string, status: string, total: number, iso: string): ProfitOrder {
  return { id, status, total, created_at: iso };
}

function item(
  orderId: string,
  productId: string | null,
  name: string,
  qty: number | string | null,
  unit: number | string | null,
): ProfitOrderItem {
  return {
    order_id: orderId,
    product_id: productId,
    product_name: name,
    quantity: qty,
    unit_price: unit,
  };
}

function base(over: Partial<ProfitInput>): ProfitInput {
  return {
    orders: [],
    orderItems: [],
    productCosts: [],
    orderCosts: [],
    returns: [],
    expenses: [],
    from: "2026-01-01",
    to: "2026-01-31",
    ...over,
  };
}

const FROM = "2026-01-01";
const TO = "2026-01-31";

describe("classifyStatus", () => {
  it("classifies known English values", () => {
    expect(classifyStatus("delivered")).toBe("delivered");
    expect(classifyStatus("pending")).toBe("pipeline");
    expect(classifyStatus("confirmed")).toBe("pipeline");
    expect(classifyStatus("shipped")).toBe("pipeline");
    expect(classifyStatus("cancelled")).toBe("cancelled");
    expect(classifyStatus("canceled")).toBe("cancelled");
  });

  it("classifies French provider strings case-insensitively and trims", () => {
    expect(classifyStatus(" Livré ")).toBe("delivered");
    expect(classifyStatus("LIVRE")).toBe("delivered");
    expect(classifyStatus("Retour")).toBe("returned");
    expect(classifyStatus("Refusé")).toBe("returned");
    expect(classifyStatus("Refusee")).toBe("returned");
    expect(classifyStatus("Annulé")).toBe("cancelled");
    expect(classifyStatus("annulee")).toBe("cancelled");
  });

  it("returns unknown for unmapped values and null", () => {
    expect(classifyStatus("en transit")).toBe("unknown");
    expect(classifyStatus("")).toBe("unknown");
    expect(classifyStatus(null)).toBe("unknown");
  });
});

describe("computeProfit", () => {
  it("returns zeros for empty input", () => {
    const r = computeProfit(base({}));
    expect(r.totals.revenue).toBe(0);
    expect(r.totals.netProfit).toBe(0);
    expect(r.totals.marginPercent).toBe(0);
    expect(r.totals.pipelineValue).toBe(0);
    expect(r.totals.counts).toEqual({
      delivered: 0,
      returned: 0,
      cancelled: 0,
      pipeline: 0,
      unknown: 0,
    });
    expect(r.byProduct).toEqual([]);
    expect(r.perOrder).toEqual([]);
  });

  it("computes a delivered order with product + delivery costs", () => {
    const r = computeProfit(
      base({
        from: FROM,
        to: TO,
        orders: [order("o1", "delivered", 10000, at(2026, 1, 15))],
        orderItems: [item("o1", "p1", "Product 1", 2, 3000)],
        productCosts: [{ product_id: "p1", cost_price: 1000 }],
        orderCosts: [{ order_id: "o1", delivery_cost: 500, return_cost: 0 }],
      }),
    );

    expect(r.totals.revenue).toBe(10000);
    expect(r.totals.costOfGoods).toBe(2000);
    expect(r.totals.deliveryCosts).toBe(500);
    expect(r.totals.netProfit).toBe(7500);
    expect(r.totals.marginPercent).toBe(75);
    expect(r.totals.counts.delivered).toBe(1);

    expect(r.byProduct).toHaveLength(1);
    expect(r.byProduct[0]).toMatchObject({
      productId: "p1",
      unitsSold: 2,
      revenue: 6000,
      cost: 2000,
      profit: 4000,
      hasCost: true,
    });

    expect(r.perOrder[0]).toMatchObject({ class: "delivered", profit: 7500, missingCost: false });
    expect(r.warnings.deliveredOrdersMissingProductCost).toBe(0);
    expect(r.warnings.deliveredOrdersMissingDeliveryCost).toBe(0);
  });

  it("flags a delivered order whose product cost is unknown without inflating profit", () => {
    const r = computeProfit(
      base({
        orders: [order("o1", "delivered", 5000, at(2026, 1, 10))],
        orderItems: [item("o1", "p2", "Mystery", 1, 5000)],
        productCosts: [],
        orderCosts: [{ order_id: "o1", delivery_cost: 300, return_cost: 0 }],
      }),
    );

    // Profit must not silently ignore the unknown cost: it reports revenue - delivery,
    // with cost treated as 0 and the gap clearly flagged.
    expect(r.totals.costOfGoods).toBe(0);
    expect(r.totals.netProfit).toBe(4700);
    expect(r.perOrder[0].missingCost).toBe(true);
    expect(r.warnings.deliveredOrdersMissingProductCost).toBe(1);
    expect(r.warnings.productsMissingCost).toEqual(["Mystery"]);
    expect(r.byProduct[0].hasCost).toBe(false);
  });

  it("counts returned orders as a loss of delivery + return cost", () => {
    const r = computeProfit(
      base({
        orders: [order("o1", "returned", 8000, at(2026, 1, 12))],
        orderCosts: [{ order_id: "o1", delivery_cost: 400, return_cost: 600 }],
      }),
    );

    expect(r.totals.revenue).toBe(0);
    expect(r.totals.returnLosses).toBe(1000);
    expect(r.totals.netProfit).toBe(-1000);
    expect(r.totals.counts.returned).toBe(1);
    expect(r.perOrder[0]).toMatchObject({ class: "returned", profit: -1000 });
  });

  it("ignores cancelled orders entirely", () => {
    const r = computeProfit(
      base({
        orders: [order("o1", "cancelled", 9999, at(2026, 1, 5))],
        orderCosts: [{ order_id: "o1", delivery_cost: 500, return_cost: 0 }],
      }),
    );

    expect(r.totals.revenue).toBe(0);
    expect(r.totals.netProfit).toBe(0);
    expect(r.totals.deliveryCosts).toBe(0);
    expect(r.totals.counts.cancelled).toBe(1);
  });

  it("adds pipeline orders to pipeline value only", () => {
    const r = computeProfit(
      base({
        orders: [
          order("o1", "pending", 3000, at(2026, 1, 8)),
          order("o2", "shipped", 2000, at(2026, 1, 9)),
        ],
      }),
    );

    expect(r.totals.pipelineValue).toBe(5000);
    expect(r.totals.revenue).toBe(0);
    expect(r.totals.counts.pipeline).toBe(2);
  });

  it("subtracts approved refunds from delivered profit", () => {
    const r = computeProfit(
      base({
        orders: [order("o1", "delivered", 10000, at(2026, 1, 15))],
        orderItems: [item("o1", "p1", "P1", 1, 4000)],
        productCosts: [{ product_id: "p1", cost_price: 1000 }],
        orderCosts: [{ order_id: "o1", delivery_cost: 0, return_cost: 0 }],
        returns: [
          { order_id: "o1", status: "approved", refund_amount: 2000 },
          { order_id: "o1", status: "rejected", refund_amount: 9999 },
          { order_id: "o1", status: "APPROVED", refund_amount: 500 },
        ],
      }),
    );

    expect(r.totals.refunds).toBe(2500);
    expect(r.totals.netProfit).toBe(10000 - 2500 - 1000 - 0);
  });

  it("subtracts expenses in the period", () => {
    const r = computeProfit(
      base({
        orders: [order("o1", "delivered", 10000, at(2026, 1, 15))],
        orderItems: [item("o1", "p1", "P1", 1, 4000)],
        productCosts: [{ product_id: "p1", cost_price: 1000 }],
        expenses: [
          { expense_date: "2026-01-10", amount: 1500 },
          { expense_date: "2026-01-20", amount: 500 },
          { expense_date: "2025-12-31", amount: 700 }, // outside range
        ],
      }),
    );

    expect(r.totals.expenses).toBe(2000);
    expect(r.totals.netProfit).toBe(10000 - 1000 - 2000);
  });

  it("respects inclusive date-range boundaries", () => {
    const r = computeProfit(
      base({
        from: "2026-01-10",
        to: "2026-01-20",
        orders: [
          order("before", "delivered", 1000, at(2026, 1, 9)),
          order("onFrom", "delivered", 2000, at(2026, 1, 10)),
          order("onTo", "delivered", 3000, at(2026, 1, 20)),
          order("after", "delivered", 4000, at(2026, 1, 21)),
        ],
      }),
    );

    expect(r.totals.revenue).toBe(5000);
    expect(r.totals.counts.delivered).toBe(2);
    expect(r.perOrder.map((o) => o.orderId)).toEqual(["onFrom", "onTo"]);
  });

  it("reports unknown statuses as a warning", () => {
    const r = computeProfit(
      base({
        orders: [
          order("o1", "en transit", 1000, at(2026, 1, 5)),
          order("o2", "distribué", 1000, at(2026, 1, 6)),
          order("o3", "en transit", 1000, at(2026, 1, 7)),
        ],
      }),
    );

    expect(r.warnings.unknownStatusOrders.count).toBe(3);
    expect(r.warnings.unknownStatusOrders.statuses).toEqual(["distribué", "en transit"]);
    expect(r.totals.netProfit).toBe(0);
  });

  it("builds a continuous daily series with revenue and net profit", () => {
    const r = computeProfit(
      base({
        from: "2026-01-10",
        to: "2026-01-12",
        orders: [order("o1", "delivered", 1000, at(2026, 1, 11))],
        expenses: [{ expense_date: "2026-01-12", amount: 100 }],
      }),
    );

    expect(r.daily.map((d) => d.date)).toEqual(["2026-01-10", "2026-01-11", "2026-01-12"]);
    expect(r.daily[1]).toEqual({ date: "2026-01-11", revenue: 1000, netProfit: 1000 });
    expect(r.daily[2]).toEqual({ date: "2026-01-12", revenue: 0, netProfit: -100 });
  });

  it("never produces NaN from null/undefined/string fields", () => {
    const r = computeProfit(
      base({
        orders: [
          { id: "o1", status: null, total: null, created_at: at(2026, 1, 11) },
          order("o2", "delivered", Number("not-a-number"), at(2026, 1, 11)),
        ],
        orderItems: [item("o2", "p1", "P1", Number("x"), null)],
        productCosts: [{ product_id: "p1", cost_price: null }],
      }),
    );

    expect(Number.isNaN(r.totals.netProfit)).toBe(false);
    expect(Number.isNaN(r.totals.marginPercent)).toBe(false);
    expect(r.totals.netProfit).toBe(0);
  });
});
