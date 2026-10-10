import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { format } from "date-fns";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  confirmZRPayment,
  getPendingZRPayments,
  type ZRPayment,
} from "@/lib/delivery/zrexpress-payments.functions";

type ZRConfirmPaymentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmed: () => void;
};

function formatAmount(value: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCreatedAt(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "PP");
}

export function ZRConfirmPaymentDialog({
  open,
  onOpenChange,
  onConfirmed,
}: ZRConfirmPaymentDialogProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar") ?? false;
  const callList = useServerFn(getPendingZRPayments);
  const callConfirm = useServerFn(confirmZRPayment);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<ZRPayment[]>([]);
  const [confirmTarget, setConfirmTarget] = useState<ZRPayment | null>(null);
  const [confirmingRef, setConfirmingRef] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setError(t("dashboard.zr.sessionExpired"));
        return;
      }
      const result = await callList({ data: { accessToken: session.access_token } });
      if (result.ok) {
        setPayments(result.payments);
      } else {
        setError(result.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("dashboard.zr.errorTitle"));
    } finally {
      setLoading(false);
    }
  }, [callList, t]);

  useEffect(() => {
    if (open) {
      void load();
    } else {
      setConfirmTarget(null);
    }
  }, [open, load]);

  const handleConfirm = useCallback(async () => {
    const target = confirmTarget;
    if (!target || inFlightRef.current) return;
    inFlightRef.current = true;
    setConfirmingRef(target.referenceId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error(t("dashboard.zr.sessionExpired"));
        return;
      }
      const result = await callConfirm({
        data: { accessToken: session.access_token, referenceId: target.referenceId },
      });
      if (result.ok) {
        toast.success(t("dashboard.zr.successToast"));
        setPayments((prev) => prev.filter((p) => p.referenceId !== target.referenceId));
        setConfirmTarget(null);
        onConfirmed();
      } else {
        toast.error(result.message || t("dashboard.zr.errorToast"));
      }
    } catch {
      toast.error(t("dashboard.zr.errorToast"));
    } finally {
      inFlightRef.current = false;
      setConfirmingRef(null);
    }
  }, [confirmTarget, callConfirm, onConfirmed, t]);

  const busy = confirmingRef !== null;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!busy) onOpenChange(next);
        }}
      >
        <DialogContent className="max-w-lg" dir={isRtl ? "rtl" : undefined}>
          <DialogHeader>
            <DialogTitle>{t("dashboard.zr.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dashboard.zr.dialogDescription")}</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : error ? (
            <div className="space-y-3 py-6 text-center">
              <p className="text-sm text-destructive break-words">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void load()} className="gap-1.5">
                <RefreshCw className="h-3.5 w-3.5" />
                {t("dashboard.zr.retry")}
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("dashboard.zr.empty")}
            </p>
          ) : (
            <div className="-mx-1 max-h-[360px] space-y-2 overflow-y-auto px-1">
              {payments.map((payment) => {
                const rowBusy = confirmingRef === payment.referenceId;
                const created = formatCreatedAt(payment.createdAt);
                return (
                  <div
                    key={payment.referenceId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-card p-3"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{payment.referenceId}</div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                        <span className="tabular-nums">{formatAmount(payment.amount)} DA</span>
                        {payment.status ? (
                          <span className="rounded border border-border/60 px-1.5 py-0.5">
                            {payment.status}
                          </span>
                        ) : null}
                        {created ? <span>{created}</span> : null}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="h-7 shrink-0 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      disabled={busy}
                      onClick={() => setConfirmTarget(payment)}
                    >
                      {rowBusy ? (
                        <Loader2 className="me-1 h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="me-1 h-3 w-3" />
                      )}
                      {t("dashboard.zr.confirm")}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!confirmTarget}
        onOpenChange={(next) => {
          if (!next && !busy) setConfirmTarget(null);
        }}
      >
        <AlertDialogContent dir={isRtl ? "rtl" : undefined}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dashboard.zr.alertTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dashboard.zr.alertBody", {
                referenceId: confirmTarget?.referenceId ?? "",
                amount: confirmTarget ? formatAmount(confirmTarget.amount) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{t("dashboard.zr.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={(event) => {
                event.preventDefault();
                void handleConfirm();
              }}
            >
              {busy ? (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="me-2 h-4 w-4" />
              )}
              {t("dashboard.zr.confirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
