import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link2, MessageCircle, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { QrOptionsForm } from "@/components/tools/qr/qr-options-form";
import { QrCustomize } from "@/components/tools/qr/qr-customize";
import { QrPreview } from "@/components/tools/qr/qr-preview";
import { useDebouncedValue } from "@/components/tools/qr/use-debounced-value";
import { buildQrPayload, defaultQrState, validateQr } from "@/components/tools/qr/qr-shared";
import type { QrFormState } from "@/components/tools/qr/qr-shared";
import { useCurrentStore } from "@/hooks/use-current-store";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/qr-code")({
  component: QrDashboardPage,
  head: () => ({
    meta: [{ title: "QR Code Generator — Fennecly" }],
  }),
});

function QrDashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { currentStore } = useCurrentStore();
  const [state, setState] = useState<QrFormState>(defaultQrState);
  const [storePhone, setStorePhone] = useState("");

  const onChange = useCallback((patch: Partial<QrFormState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("store_contact_info")
      .select("contact_phone")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setStorePhone(data?.contact_phone ?? "");
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const errors = useMemo(() => validateQr(state), [state]);
  const previewState = useDebouncedValue(state, 250);
  const previewValid = useMemo(
    () =>
      Object.keys(validateQr(previewState)).length === 0 && buildQrPayload(previewState).length > 0,
    [previewState],
  );

  const storeSlug = currentStore?.slug ?? "";
  const hasPresets = Boolean(storeSlug || storePhone.trim());

  const applyStoreLink = () => {
    if (!storeSlug) return;
    onChange({ type: "url", url: `${window.location.origin}/s/${storeSlug}` });
  };

  const applyWhatsapp = () => {
    if (!storePhone.trim()) return;
    onChange({ type: "whatsapp", waPhone: storePhone, waMessage: "" });
  };

  const isRtl = i18n.language === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={QrCode}
        title={t("dashboard.qr.title")}
        description={t("dashboard.qr.description")}
      />

      {hasPresets && (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">{t("dashboard.qr.presetsTitle")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {storeSlug && (
              <Button variant="outline" size="sm" onClick={applyStoreLink}>
                <Link2 className="h-4 w-4" />
                {t("dashboard.qr.presetStore")}
              </Button>
            )}
            {storePhone.trim() && (
              <Button variant="outline" size="sm" onClick={applyWhatsapp}>
                <MessageCircle className="h-4 w-4" />
                {t("dashboard.qr.presetWhatsapp")}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="space-y-6 lg:order-2 lg:sticky lg:top-4">
          <QrPreview state={previewState} valid={previewValid} />
        </div>
        <div className="space-y-6 lg:order-1">
          <QrOptionsForm state={state} errors={errors} onChange={onChange} />
          <QrCustomize state={state} errors={errors} onChange={onChange} />
        </div>
      </div>
    </div>
  );
}
