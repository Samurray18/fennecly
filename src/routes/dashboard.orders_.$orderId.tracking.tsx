import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Package,
  Truck,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  ClipboardCheck,
  PackageCheck,
  Code2,
  MessageCircle,
  PhoneCall,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentStore } from "@/hooks/use-current-store";
import { supabase } from "@/integrations/supabase/client";
import { trackOrderShipment, type TrackingDTO } from "@/lib/delivery/track-shipment.functions";
import { WhatsAppCallButton } from "@/components/dashboard/WhatsAppCallButton";
import { useBordereaux, type BordereauOrder } from "@/hooks/use-bordereaux";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders"> & { zr_colis_id?: string | null };

export const Route = createFileRoute("/dashboard/orders_/$orderId/tracking")({
  component: TrackingPage,
  head: () => ({ meta: [{ title: "Order tracking — Fennecly" }] }),
});

const STATUS_FLOW = [
  "created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
] as const;
type StatusFlow = (typeof STATUS_FLOW)[number];

/**
 * Map raw ZRExpress status to our flow step.
 * ZRExpress uses French statuses — we match broadly.
 */
function mapToFlowIndex(raw: string): number {
  const s = (raw || "").toLowerCase().trim();
  // Delivered
  if (s.includes("livr") || s.includes("deliv") || s.includes("remis")) return 4;
  // Out for delivery
  if (s.includes("distribution") || s.includes("out_for") || s.includes("out for")) return 3;
  // In transit (broad match — most ZR statuses land here)
  if (
    s.includes("transit") ||
    s.includes("route") ||
    s.includes("expedi") ||
    s.includes("envoi") ||
    s.includes("shipped") ||
    s.includes("envoy") ||
    s.includes("acheminement") ||
    s.includes("charg") ||
    s.includes("depart") ||
    s.includes("départ") ||
    s.includes("sorti") ||
    s.includes("pickup") ||
    s.includes("recup") ||
    s.includes("récup") ||
    s.includes("pris") ||
    s.includes("ramass")
  )
    return 2;
  // Created / pending / preparing
  if (
    s.includes("cree") ||
    s.includes("créé") ||
    s.includes("created") ||
    s.includes("pret") ||
    s.includes("prêt") ||
    s.includes("prepar") ||
    s.includes("attente") ||
    s.includes("pending") ||
    s.includes("enregistr") ||
    s.includes("register")
  )
    return 1;
  // If we have a status but can't map it, put it at step 1 (at least created)
  return s ? 1 : 0;
}

const FLOW_LABELS: Record<StatusFlow, string> = {
  created: "Order Created",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const costsSchema = z.object({
  delivery_cost: z.number().min(0, "Cost cannot be negative").max(100_000_000),
  return_cost: z.number().min(0, "Cost cannot be negative").max(100_000_000),
});

function TrackingPage() {
  const { orderId } = Route.useParams();
  const { user } = useAuth();
  const { currentStore } = useCurrentStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const trackFn = useServerFn(trackOrderShipment);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState<TrackingDTO | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [callHistory, setCallHistory] = useState<
    { id: string; outcome: string; called_at: string; channel: string; customer_name: string | null; note: string | null }[]
  >([]);
  const { printBordereaux, loading: printingBordereau } = useBordereaux();
  const [codTracked, setCodTracked] = useState<boolean | null>(null);
  const [codLogging, setCodLogging] = useState(false);
  const [deliveryCost, setDeliveryCost] = useState("");
  const [returnCost, setReturnCost] = useState("");
  const [costSaving, setCostSaving] = useState(false);

  const loadOrder = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
      setOrder(data ?? null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const loadCallHistory = async () => {
    const { data } = await (supabase as unknown as { from: (t: string) => ReturnType<typeof supabase.from> })
      .from("call_logs")
      .select("id, outcome, called_at, channel, customer_name, note")
      .eq("order_id", orderId)
      .order("called_at", { ascending: false });
    setCallHistory((data ?? []) as typeof callHistory);
  };

  const refreshTracking = async () => {
    const { data: session } = await supabase.auth.getSession();
    const accessToken = session.session?.access_token;
    if (!accessToken) {
      toast.error("Please sign in again.");
      return;
    }
    setRefreshing(true);
    setErrorMsg(null);
    try {
      const res = (await trackFn({ data: { accessToken, orderId } })) as {
        ok: boolean;
        tracking?: TrackingDTO;
        message?: string;
      };
      if (res.ok && res.tracking) {
        setTracking(res.tracking);
        setLastRefreshed(new Date());
      } else {
        setErrorMsg(res.message ?? "Tracking failed.");
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Failed to fetch status.");
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh every 30s while the page is open.
  useEffect(() => {
    if (!autoRefresh || !order?.tracking_number) return;
    const id = setInterval(() => {
      void refreshTracking();
    }, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, order?.tracking_number]);

  useEffect(() => {
    if (!user) return;
    void loadOrder();
    void loadCallHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, orderId]);

  useEffect(() => {
    if (order?.tracking_number) void refreshTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.tracking_number]);

  useEffect(() => {
    if (!user || !orderId) return;
    supabase
      .from("cod_collections")
      .select("id")
      .eq("merchant_id", user.id)
      .eq("order_id", orderId)
      .maybeSingle()
      .then(({ data }) => setCodTracked(!!data));
  }, [user, orderId]);

  useEffect(() => {
    if (!user || !orderId) return;
    supabase
      .from("order_costs")
      .select("delivery_cost,return_cost")
      .eq("order_id", orderId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setDeliveryCost(String(data.delivery_cost));
        setReturnCost(String(data.return_cost));
      });
  }, [user, orderId]);

  const saveCosts = async () => {
    if (!user || !order) return;
    const storeId = order.store_id ?? currentStore?.id ?? null;
    const parsed = costsSchema.safeParse({
      delivery_cost: deliveryCost.trim() === "" ? 0 : Number(deliveryCost),
      return_cost: returnCost.trim() === "" ? 0 : Number(returnCost),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    if (!storeId) {
      toast.error(t("dashboard.costs.saveFailed"));
      return;
    }
    setCostSaving(true);
    const { error } = await supabase.from("order_costs").upsert(
      {
        order_id: order.id,
        owner_id: user.id,
        store_id: storeId,
        delivery_cost: parsed.data.delivery_cost,
        return_cost: parsed.data.return_cost,
      },
      { onConflict: "order_id" },
    );
    setCostSaving(false);
    if (error) {
      toast.error(t("dashboard.costs.saveFailed"));
      return;
    }
    toast.success(t("dashboard.costs.saved"));
  };

  const logToCOD = async () => {
    if (!user || !order) return;
    setCodLogging(true);
    const { error } = await supabase.from("cod_collections").insert({
      merchant_id: user.id,
      order_id: order.id,
      delivery_company: order.delivery_type || "ZR Express",
      tracking_number: order.tracking_number,
      customer_name: order.customer_name,
      amount: Math.round(Number(order.total) || 0),
      status: order.status === "delivered" ? "delivered" : "in_transit",
    });
    setCodLogging(false);
    if (error) return toast.error(error.message);
    setCodTracked(true);
    toast.success("Added to COD Manager");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center">
        <p className="text-muted-foreground">Order not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const flowIdx = tracking ? mapToFlowIndex(tracking.rawStatus ?? tracking.status) : -1;
  const displayStatus = tracking?.rawStatus ?? tracking?.status ?? order.status;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-3 pt-2">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard/orders" })}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageHeader
          eyebrow="Shipment"
          title="Order tracking"
          description={`Order #${order.id.slice(0, 8).toUpperCase()}`}
          icon={Truck}
          gradient="from-emerald-500 via-teal-500 to-cyan-500"
        />
        <div className="pt-6 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="accent-primary h-3.5 w-3.5"
              />
              Auto-refresh 30s
            </label>
            <Button
              onClick={() => void refreshTracking()}
              disabled={refreshing || !order.tracking_number}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1.5" />
              )}
              Refresh Status
            </Button>
          </div>
          {lastRefreshed && (
            <span className="text-[11px] text-muted-foreground">
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
      </div>

      {/* Call history section */}
      <Card className="border-border/60 mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <PhoneCall className="h-4 w-4" />
              Call history
            </CardTitle>
            {order.customer_phone && (
              <WhatsAppCallButton
                customerPhone={order.customer_phone}
                customerName={order.customer_name}
                orderId={order.id}
                orderNumber={`#${order.id.slice(0, 8).toUpperCase()}`}
                size="md"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {callHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">No calls yet</p>
          ) : (
            <ol className="space-y-3">
              {callHistory.map((call) => (
                <li key={call.id} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {call.channel === "whatsapp" ? (
                      <MessageCircle className="h-4 w-4 text-[#25D366]" />
                    ) : (
                      <Phone className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-sm font-medium">
                        Called {call.customer_name || "customer"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(call.called_at), { addSuffix: true })}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          call.outcome === "answered" &&
                            "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
                          call.outcome === "no_answer" &&
                            "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
                          call.outcome === "callback" &&
                            "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
                          call.outcome === "pending" &&
                            "bg-muted text-muted-foreground border-border",
                        )}
                      >
                        {call.outcome === "answered" && "Answered"}
                        {call.outcome === "no_answer" && "No answer"}
                        {call.outcome === "callback" && "Call back later"}
                        {call.outcome === "pending" && "Pending"}
                      </Badge>
                    </div>
                    {call.note && (
                      <p className="text-xs text-muted-foreground mt-0.5">{call.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>

      {!order.tracking_number && (
        <Card className="border-amber-500/30 bg-amber-500/5 mb-6">
          <CardContent className="p-4 text-sm text-amber-700 dark:text-amber-400">
            This order has not been sent to ZRExpress yet. Send it from the orders page to start
            tracking.
          </CardContent>
        </Card>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Provider status banner */}
      {tracking && (
        <Card className="mb-6 border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Current Status</span>
              </div>
              <Badge variant="outline" className="text-sm font-medium capitalize px-3 py-1">
                {displayStatus}
              </Badge>
              {tracking.trackingNumber && (
                <span className="text-xs text-muted-foreground font-mono">
                  #{tracking.trackingNumber}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress stepper */}
      <Card className="border-border/60 mb-6">
        <CardHeader>
          <CardTitle className="text-base">Delivery progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex justify-between gap-2 relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-border" />
              <div
                className="absolute top-5 left-5 h-0.5 bg-primary transition-all"
                style={{
                  width:
                    flowIdx <= 0
                      ? "0%"
                      : `calc(${(flowIdx / (STATUS_FLOW.length - 1)) * 100}% - ${flowIdx === STATUS_FLOW.length - 1 ? "2.5rem" : "0rem"})`,
                }}
              />
              {STATUS_FLOW.map((step, idx) => {
                const completed = idx <= flowIdx;
                const isCurrent = idx === flowIdx;
                const Icon =
                  idx === 0
                    ? ClipboardCheck
                    : idx === 1
                      ? Package
                      : idx === 2
                        ? Truck
                        : idx === 3
                          ? PackageCheck
                          : CheckCircle2;
                // Show the raw ZRExpress status text for the current step
                const label = isCurrent && displayStatus ? displayStatus : FLOW_LABELS[step];
                return (
                  <div
                    key={step}
                    className="flex flex-col items-center gap-2 relative z-10 flex-1 min-w-0"
                  >
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        completed
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-[11px] text-center font-medium leading-tight ${
                        isCurrent
                          ? "text-primary font-bold"
                          : completed
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order info */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Order details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <InfoRow icon={ClipboardCheck} label="Tracking">
              <span className="font-mono">{order.tracking_number || "—"}</span>
            </InfoRow>
            {(order.zr_colis_id || order.tracking_number) && (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log("Bordereau order fields:", {
                      zr_colis_id: order.zr_colis_id,
                      tracking_number: order.tracking_number,
                      id: order.id,
                    });
                    const bo: BordereauOrder = {
                      id: order.id,
                      zr_colis_id: order.zr_colis_id,
                      tracking_number: order.tracking_number,
                      customer_name: order.customer_name,
                    };
                    printBordereaux([bo]);
                  }}
                  disabled={printingBordereau}
                >
                  {printingBordereau ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Truck className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {printingBordereau ? "Fetching PDF..." : "Print bordereau"}
                </Button>
                <Badge variant="outline" className="bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30 text-[10px] px-1.5 py-0">
                  ZR label ready
                </Badge>
              </div>
            )}
            <div className="pt-2 border-t border-border/60">
              {codTracked === false ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={logToCOD}
                  disabled={codLogging}
                >
                  {codLogging ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Wallet className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  تسجيل في COD Manager
                </Button>
              ) : codTracked === true ? (
                <Link
                  to="/dashboard/apps/cod-manager"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Wallet className="h-3.5 w-3.5" />
                  Already tracked in COD Manager
                </Link>
              ) : null}
            </div>
            <InfoRow icon={User} label="Customer">
              {order.customer_name}
            </InfoRow>
            <InfoRow icon={Phone} label="Phone">
              <a
                href={`tel:${order.customer_phone || order.shipping_address}`}
                className="hover:text-primary"
              >
                {order.customer_phone || order.shipping_address}
              </a>
            </InfoRow>
            <InfoRow icon={MapPin} label="Wilaya">
              {order.shipping_postal_code || "—"}
              <span className="text-muted-foreground"> · {order.shipping_city}</span>
            </InfoRow>
            <InfoRow icon={MapPin} label="Address">
              {order.shipping_address}
            </InfoRow>
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{Number(order.total).toFixed(2)} DA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Current status</span>
              <Badge variant="outline" className="capitalize">
                {displayStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* History — ZRExpress exact statements */}
        <Card className="border-border/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Tracking history</CardTitle>
              {tracking?.providerResponseJson && (
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Code2 className="h-3 w-3" />
                  {showRaw ? "Hide" : "Show"} raw
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showRaw && tracking?.providerResponseJson ? (
              <pre className="max-h-[50vh] overflow-auto rounded-md bg-muted p-3 text-xs font-mono whitespace-pre-wrap break-all">
                {(() => {
                  try {
                    return JSON.stringify(JSON.parse(tracking.providerResponseJson), null, 2);
                  } catch {
                    return tracking.providerResponseJson;
                  }
                })()}
              </pre>
            ) : refreshing && !tracking ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : tracking?.history && tracking.history.length > 0 ? (
              <ol className="space-y-0">
                {tracking.history.map((h, i) => {
                  const isFirst = i === 0;
                  const locParts = [h.location, h.city, h.wilaya].filter(Boolean);
                  const locationStr = locParts.join(", ");
                  return (
                    <li key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`h-3 w-3 rounded-full mt-1 ${
                            isFirst ? "bg-primary ring-2 ring-primary/20" : "bg-muted-foreground/40"
                          }`}
                        />
                        {i < tracking.history.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className={`flex-1 pb-4 ${isFirst ? "" : "opacity-80"}`}>
                        <div
                          className={`text-sm font-medium ${isFirst ? "" : "text-muted-foreground"}`}
                        >
                          {h.status || "—"}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                          {h.date && <span>{new Date(h.date).toLocaleString()}</span>}
                          {locationStr && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {locationStr}
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tracking history available yet.
                {tracking?.lastUpdate && (
                  <> Last update: {new Date(tracking.lastUpdate).toLocaleString()}.</>
                )}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Private cost data — never shown on the storefront */}
      <Card className="border-border/60 mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            {t("dashboard.costs.orderCostsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-muted-foreground">
            {t("dashboard.costs.orderCostsDescription")}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="delivery_cost">{t("dashboard.costs.deliveryCostLabel")}</Label>
              <Input
                id="delivery_cost"
                type="number"
                step="0.01"
                min="0"
                value={deliveryCost}
                onChange={(e) => setDeliveryCost(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return_cost">{t("dashboard.costs.returnCostLabel")}</Label>
              <Input
                id="return_cost"
                type="number"
                step="0.01"
                min="0"
                value={returnCost}
                onChange={(e) => setReturnCost(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveCosts} disabled={costSaving}>
              {costSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
              {t("dashboard.costs.save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm break-words">{children}</div>
      </div>
    </div>
  );
}
