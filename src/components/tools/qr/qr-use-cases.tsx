import { useTranslation } from "react-i18next";
import { ClipboardList, MessageCircle, Package, Share2, type LucideIcon } from "lucide-react";

type UseCase = { icon: LucideIcon; titleKey: string; bodyKey: string };

const USE_CASES: UseCase[] = [
  { icon: Package, titleKey: "packaging", bodyKey: "packagingBody" },
  { icon: MessageCircle, titleKey: "whatsapp", bodyKey: "whatsappBody" },
  { icon: Share2, titleKey: "social", bodyKey: "socialBody" },
  { icon: ClipboardList, titleKey: "tracking", bodyKey: "trackingBody" },
];

export function QrUseCases() {
  const { t } = useTranslation();

  return (
    <section className="space-y-5">
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {t("tools.qr.useCases.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("tools.qr.useCases.body")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {USE_CASES.map(({ icon: Icon, titleKey, bodyKey }) => (
          <article
            key={titleKey}
            className="rounded-2xl border border-border/60 bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <Icon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="font-display text-sm font-semibold">
              {t(`tools.qr.useCases.${titleKey}`)}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(`tools.qr.useCases.${bodyKey}`)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
