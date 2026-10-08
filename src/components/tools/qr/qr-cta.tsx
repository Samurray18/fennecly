import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Conversion block that sits directly beneath the free tool. */
export function QrCta() {
  const { t } = useTranslation();

  return (
    <section className="overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-600/15 via-violet-600/5 to-transparent p-6 sm:p-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-400">
            <Sparkles className="h-3.5 w-3.5" />
            {t("tools.qr.cta.badge")}
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            {t("tools.qr.cta.title")}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("tools.qr.cta.body")}
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-fuchsia-500"
          >
            <Link to="/signup">
              {t("tools.qr.cta.button")}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Link>
          </Button>
          <Link
            to="/login"
            className="text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("tools.qr.cta.secondary")}
          </Link>
        </div>
      </div>
    </section>
  );
}
