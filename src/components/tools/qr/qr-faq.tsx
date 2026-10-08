import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_IDS = ["what", "account", "colors", "correction", "expiry"] as const;

export function QrFaq() {
  const { t } = useTranslation();

  return (
    <section className="space-y-5">
      <div className="max-w-2xl">
        <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
          {t("tools.qr.faq.title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {t("tools.qr.faq.body")}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_IDS.map((id) => (
          <AccordionItem key={id} value={id} className="border-border/60">
            <AccordionTrigger className="font-display text-sm font-semibold hover:no-underline sm:text-base">
              {t(`tools.qr.faq.${id}Q`)}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
              {t(`tools.qr.faq.${id}A`)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
