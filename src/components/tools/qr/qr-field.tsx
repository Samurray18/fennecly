import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

type QrFieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

/** Label + control + hint, with the zod issue code translated to a friendly message. */
export function QrField({ id, label, error, hint, children }: QrFieldProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {t(`tools.qr.errors.${error}`)}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
