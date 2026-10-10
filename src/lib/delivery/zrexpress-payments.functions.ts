import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { createAuthenticatedDeliveryClient } from "./authenticated-client";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeProviderKey } from "./registry";

const ZR_BASE_URL = "https://api.zrexpress.app/api/v1";
const PER_REQUEST_TIMEOUT_MS = 12_000;
const MAX_PAGES = 5;
const PAGE_SIZE = 100;

const ListInputSchema = z.object({
  accessToken: z.string().min(1).max(4096),
});

const ConfirmInputSchema = z.object({
  accessToken: z.string().min(1).max(4096),
  referenceId: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[A-Za-z0-9._-]+$/),
});

/** A supplier payment awaiting confirmation (acceptedAt is empty). */
export type ZRPayment = {
  referenceId: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type ZRPendingPaymentsResult =
  | { ok: true; payments: ZRPayment[]; total: number }
  | { ok: false; message: string; notConnected?: boolean };

export type ZRConfirmPaymentResult = { ok: true; id: string } | { ok: false; message: string };

type ZrConnection =
  | { ok: true; headers: Record<string, string>; requestSignal: AbortSignal | undefined }
  | { ok: false; message: string; notConnected?: boolean };

type ZrFetchResult = { ok: true; status: number; text: string } | { ok: false; message: string };

/**
 * Resolves the store's ZRExpress credentials (never returned to the client) and
 * builds the outbound headers, mirroring zrexpress-balance.functions.ts.
 */
async function resolveConnection(accessToken: string): Promise<ZrConnection> {
  const auth = await createAuthenticatedDeliveryClient(accessToken);
  if ("error" in auth) {
    return { ok: false, message: "Your session expired. Please sign in again." };
  }
  const { userId } = auth;
  const { client: supabase } = auth;

  const { data: companies } = await supabase.from("delivery_companies").select("id, name");
  const zr = (companies ?? []).find((c) => normalizeProviderKey(c.name) === "zr_express");
  if (!zr) {
    return { ok: false, notConnected: true, message: "ZRExpress is not configured." };
  }

  const { data: link } = await supabaseAdmin
    .from("store_delivery_companies")
    .select("api_key, api_secret, enabled")
    .eq("store_id", userId)
    .eq("company_id", zr.id)
    .maybeSingle();
  if (!link?.api_key?.trim()) {
    return { ok: false, notConnected: true, message: "Connect ZRExpress first." };
  }

  const apiKey = link.api_key.trim();
  const tenantId = (link.api_secret ?? "").trim();

  const requestSignal = (() => {
    try {
      return getRequest()?.signal ?? undefined;
    } catch {
      return undefined;
    }
  })();

  return {
    ok: true,
    requestSignal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-Tenant": tenantId,
      "X-Api-Key": apiKey,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
}

/** Single outbound request with the 12 s timeout + chained request signal. */
async function zrFetch(
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
  requestSignal: AbortSignal | undefined,
): Promise<ZrFetchResult> {
  const controller = new AbortController();
  const signal = requestSignal
    ? AbortSignal.any([controller.signal, requestSignal])
    : controller.signal;
  const timer = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: init.method,
      headers: init.headers,
      body: init.body,
      signal,
    });
    const text = await res.text();
    if (import.meta.env.DEV) {
      console.log(
        `[ZR Payments] ${init.method} ${url} -> ${res.status} ${res.statusText} :: ${text.slice(0, 500)}`,
      );
    }
    if (!res.ok) {
      const detail = text.slice(0, 200).trim();
      return {
        ok: false,
        message: `ZRExpress returned ${res.status}${detail ? `: ${detail}` : ` (${res.statusText})`}`,
      };
    }
    return { ok: true, status: res.status, text };
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    if (raw.toLowerCase().includes("aborted")) {
      return { ok: false, message: "ZRExpress API timed out. Try again." };
    }
    return { ok: false, message: `ZRExpress request failed: ${raw}` };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Loads every supplier payment whose acceptedAt is empty, following hasNext up
 * to MAX_PAGES pages, sorted newest first.
 */
async function fetchPendingPayments(
  headers: Record<string, string>,
  requestSignal: AbortSignal | undefined,
): Promise<{ ok: true; payments: ZRPayment[] } | { ok: false; message: string }> {
  const collected: ZRPayment[] = [];
  const url = `${ZR_BASE_URL}/supplier-payment/search`;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await zrFetch(
      url,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ pageNumber: page, pageSize: PAGE_SIZE }),
      },
      requestSignal,
    );
    if (!res.ok) return { ok: false, message: res.message };

    const parsed = parsePendingPage(res.text);
    if (!parsed.ok) return { ok: false, message: parsed.message };

    collected.push(...parsed.payments);
    if (!parsed.hasNext) break;
  }

  collected.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  return { ok: true, payments: collected };
}

function parsePendingPage(
  text: string,
): { ok: true; payments: ZRPayment[]; hasNext: boolean } | { ok: false; message: string } {
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    return { ok: false, message: "ZRExpress returned a non-JSON response." };
  }
  const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  const inner =
    obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;
  const rawItems = Array.isArray(inner.items) ? inner.items : Array.isArray(parsed) ? parsed : [];

  const payments: ZRPayment[] = [];
  for (const item of rawItems) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const referenceId = typeof rec.referenceId === "string" ? rec.referenceId.trim() : "";
    if (!referenceId) continue;
    // Pending confirmation == acceptedAt is null or empty. No status strings.
    const acceptedAt = rec.acceptedAt;
    const isPending =
      acceptedAt === null ||
      acceptedAt === undefined ||
      (typeof acceptedAt === "string" && acceptedAt.trim() === "");
    if (!isPending) continue;
    const amount = pickNum(rec, ["amount", "montant", "totalAmount", "value"]);
    payments.push({
      referenceId,
      amount: Number.isFinite(amount) ? amount : 0,
      status:
        typeof rec.status === "string"
          ? rec.status
          : rec.status === null || rec.status === undefined
            ? ""
            : String(rec.status),
      createdAt: typeof rec.createdAt === "string" ? rec.createdAt : "",
    });
  }

  return { ok: true, payments, hasNext: inner.hasNext === true };
}

export const getPendingZRPayments = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListInputSchema.parse(input))
  .handler(async ({ data }): Promise<ZRPendingPaymentsResult> => {
    try {
      const connection = await resolveConnection(data.accessToken);
      if (!connection.ok) return connection;

      const pending = await fetchPendingPayments(connection.headers, connection.requestSignal);
      if (!pending.ok) return { ok: false, message: pending.message };

      return { ok: true, payments: pending.payments, total: pending.payments.length };
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      if (raw.toLowerCase().includes("aborted")) {
        return { ok: false, message: "ZRExpress API timed out. Try again." };
      }
      return { ok: false, message: `ZRExpress request failed: ${raw}` };
    }
  });

export const confirmZRPayment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ConfirmInputSchema.parse(input))
  .handler(async ({ data }): Promise<ZRConfirmPaymentResult> => {
    try {
      const connection = await resolveConnection(data.accessToken);
      if (!connection.ok) return { ok: false, message: connection.message };

      // Safety: only payments that are currently pending may be confirmed.
      const pending = await fetchPendingPayments(connection.headers, connection.requestSignal);
      if (!pending.ok) return { ok: false, message: pending.message };
      if (!pending.payments.some((p) => p.referenceId === data.referenceId)) {
        return { ok: false, message: "This payment is not pending confirmation." };
      }

      const url = `${ZR_BASE_URL}/supplier-payment/${encodeURIComponent(data.referenceId)}`;
      const res = await zrFetch(
        url,
        {
          method: "PUT",
          headers: connection.headers,
          body: JSON.stringify({ referenceId: data.referenceId }),
        },
        connection.requestSignal,
      );
      if (!res.ok) return { ok: false, message: res.message };

      const id = parseConfirmId(res.text);
      if (!id) {
        return { ok: false, message: "ZRExpress did not return a confirmation id." };
      }
      return { ok: true, id };
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      if (raw.toLowerCase().includes("aborted")) {
        return { ok: false, message: "ZRExpress API timed out. Try again." };
      }
      return { ok: false, message: `ZRExpress request failed: ${raw}` };
    }
  });

function parseConfirmId(text: string): string | null {
  try {
    const parsed: unknown = text ? JSON.parse(text) : null;
    const obj = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
    const inner =
      obj.data && typeof obj.data === "object" ? (obj.data as Record<string, unknown>) : obj;
    const id = inner.id;
    if (typeof id === "string" && id.trim()) return id.trim();
    return null;
  } catch {
    return null;
  }
}

function pickNum(obj: Record<string, unknown>, keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() && !Number.isNaN(Number(v))) return Number(v);
  }
  return Number.NaN;
}
