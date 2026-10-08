import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { QrOptionsForm } from "@/components/tools/qr/qr-options-form";
import { QrCustomize } from "@/components/tools/qr/qr-customize";
import { QrPreview } from "@/components/tools/qr/qr-preview";
import { QrUseCases } from "@/components/tools/qr/qr-use-cases";
import { QrCta } from "@/components/tools/qr/qr-cta";
import { QrFaq } from "@/components/tools/qr/qr-faq";
import { useDebouncedValue } from "@/components/tools/qr/use-debounced-value";
import { buildQrPayload, defaultQrState, validateQr } from "@/components/tools/qr/qr-shared";
import type { QrFormState } from "@/components/tools/qr/qr-shared";

const FAQ_SCHEMA = [
  {
    q: "What is a QR code?",
    a: "A QR code is a scannable square barcode that can store text, links, Wi-Fi logins and contact details. Point a phone camera at it and the content opens instantly — no typing required.",
  },
  {
    q: "Is this QR code generator free?",
    a: "Yes. The generator is free to use and needs no account or login. Every code you create works forever and can be downloaded as a PNG or SVG.",
  },
  {
    q: "Will changing the colours break the QR code?",
    a: "Not if there is enough contrast between the foreground and background. The tool warns you when contrast drops below the safe 3:1 threshold.",
  },
  {
    q: "What error correction level should I choose?",
    a: "Level M is a good balance of density and durability for most codes. Use Q or H when the code will be printed small, handled often, or overlaid with a logo — the tool switches to H automatically when you add a logo.",
  },
  {
    q: "Do QR codes expire?",
    a: "No. Static QR codes like these store their content directly in the image, so they never expire and never require a subscription.",
  },
];

export const Route = createFileRoute("/tools/qr-code")({
  component: QrCodePage,
  head: () => ({
    meta: [
      { title: "Free QR Code Generator — Links, WhatsApp, Wi-Fi | Fennecly" },
      {
        name: "description",
        content:
          "Create a free QR code in seconds. Custom colours, your own logo, PNG and SVG download for URLs, WhatsApp, Wi-Fi, phone and email. No signup required.",
      },
      { property: "og:title", content: "Free QR Code Generator — Fennecly" },
      {
        property: "og:description",
        content:
          "Free unlimited QR codes for links, WhatsApp, Wi-Fi, phone and email. Custom colours and logo, PNG and SVG export, no account needed.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://fennecly.online/tools/qr-code" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_SCHEMA.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Fennecly QR Code Generator",
          url: "https://fennecly.online/tools/qr-code",
          applicationCategory: "DesignApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
});

function QrCodePage() {
  const { t, i18n } = useTranslation();
  const [state, setState] = useState<QrFormState>(defaultQrState);

  const onChange = useCallback((patch: Partial<QrFormState>) => {
    setState((previous) => ({ ...previous, ...patch }));
  }, []);

  const errors = useMemo(() => validateQr(state), [state]);
  const previewState = useDebouncedValue(state, 250);
  const previewValid = useMemo(
    () =>
      Object.keys(validateQr(previewState)).length === 0 && buildQrPayload(previewState).length > 0,
    [previewState],
  );

  const isRtl = i18n.language === "ar";

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:pt-32">
        <header className="mb-8 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
            {t("tools.qr.hero.badge")}
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
            {t("tools.qr.hero.title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t("tools.qr.hero.subtitle")}
          </p>
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6 lg:order-2 lg:sticky lg:top-24">
            <QrPreview state={previewState} valid={previewValid} />
          </div>
          <div className="space-y-6 lg:order-1">
            <QrOptionsForm state={state} errors={errors} onChange={onChange} />
            <QrCustomize state={state} errors={errors} onChange={onChange} />
          </div>
        </div>

        <div className="mt-16 space-y-16 md:mt-20">
          <QrUseCases />
          <QrCta />
          <QrFaq />
        </div>
      </main>

      <Footer />
    </div>
  );
}
