import { useTranslation } from "react-i18next";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { QrField } from "./qr-field";
import { ERROR_CORRECTION_LEVELS, loadImage } from "./qr-shared";
import type { QrErrorCorrection, QrErrors, QrFormState } from "./qr-shared";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_MAX_EDGE = 320;

/** Downscales and re-encodes the chosen image entirely in the browser. */
async function processLogoFile(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("unsupported");
  if (file.size > MAX_LOGO_BYTES) throw new Error("too-large");

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });

  const image = await loadImage(dataUrl);
  if (!image.width || !image.height) return dataUrl;

  const scale = Math.min(1, LOGO_MAX_EDGE / Math.max(image.width, image.height));
  if (scale >= 1) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

type QrCustomizeProps = {
  state: QrFormState;
  errors: QrErrors;
  onChange: (patch: Partial<QrFormState>) => void;
};

export function QrCustomize({ state, errors, onChange }: QrCustomizeProps) {
  const { t } = useTranslation();
  const logoLocked = Boolean(state.logoDataUrl);

  const handleLogoFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await processLogoFile(file);
      onChange({ logoDataUrl: dataUrl, errorCorrection: "H" });
    } catch (error) {
      toast.error(
        error instanceof Error && error.message === "too-large"
          ? t("tools.qr.logo.tooLarge")
          : t("tools.qr.logo.failed"),
      );
    }
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <h2 className="mb-4 font-display text-base font-semibold">{t("tools.qr.customize.title")}</h2>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <ColorField
            id="qr-fg"
            label={t("tools.qr.customize.foreground")}
            value={state.fg}
            error={errors.fg}
            onChange={(value) => onChange({ fg: value })}
          />
          <ColorField
            id="qr-bg"
            label={t("tools.qr.customize.background")}
            value={state.bg}
            error={errors.bg}
            onChange={(value) => onChange({ bg: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="qr-size">{t("tools.qr.customize.size")}</Label>
            <span className="text-xs tabular-nums text-muted-foreground">{state.size}px</span>
          </div>
          <Slider
            id="qr-size"
            min={256}
            max={1024}
            step={64}
            value={[state.size]}
            onValueChange={(values) => onChange({ size: values[0] ?? state.size })}
            aria-label={t("tools.qr.customize.size")}
          />
          {errors.size && (
            <p role="alert" className="text-xs font-medium text-destructive">
              {t(`tools.qr.errors.${errors.size}`)}
            </p>
          )}
        </div>

        <QrField
          id="qr-ec"
          label={t("tools.qr.customize.errorCorrection")}
          hint={
            logoLocked
              ? t("tools.qr.customize.logoLocked")
              : t(`tools.qr.ecHint.${state.errorCorrection}`)
          }
          error={errors.errorCorrection}
        >
          <div
            role="radiogroup"
            aria-label={t("tools.qr.customize.errorCorrection")}
            className="grid grid-cols-4 gap-1 rounded-lg border border-border/60 bg-muted/40 p-1"
          >
            {ERROR_CORRECTION_LEVELS.map((level: QrErrorCorrection) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={logoLocked ? level === "H" : level === state.errorCorrection}
                disabled={logoLocked && level !== "H"}
                onClick={() => onChange({ errorCorrection: level })}
                className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
                  logoLocked
                    ? level === "H"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground opacity-50"
                    : level === state.errorCorrection
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </QrField>

        <div className="space-y-2">
          <Label>{t("tools.qr.customize.logo")}</Label>
          {state.logoDataUrl ? (
            <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3">
              <img
                src={state.logoDataUrl}
                alt={t("tools.qr.customize.logoAlt")}
                className="h-12 w-12 rounded-md bg-background object-contain p-1"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{t("tools.qr.customize.logoSet")}</p>
              </div>
              <button
                type="button"
                onClick={() => onChange({ logoDataUrl: null })}
                aria-label={t("tools.qr.customize.logoRemove")}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border/70 bg-muted/30 p-3 transition-colors hover:border-primary/50">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-background">
                <ImagePlus className="h-4 w-4 text-muted-foreground" />
              </span>
              <span className="text-sm text-muted-foreground">
                {t("tools.qr.customize.logoUpload")}
              </span>
              <Input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  void handleLogoFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          )}
          <p className="text-xs text-muted-foreground">{t("tools.qr.customize.logoHint")}</p>
        </div>
      </div>
    </div>
  );
}

type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function ColorField({ id, label, value, error, onChange }: ColorFieldProps) {
  const { t } = useTranslation();
  const isHex = /^#[0-9a-f]{6}$/i.test(value);

  return (
    <QrField id={id} label={label} error={error}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={label}
          value={isHex ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-border/60 bg-transparent p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="#000000"
          maxLength={7}
          spellCheck={false}
          className="h-10 flex-1 font-mono text-sm uppercase"
          aria-describedby={`${id}-preview`}
        />
        <span
          id={`${id}-preview`}
          aria-label={t("tools.qr.customize.colorPreview")}
          className="h-10 w-10 shrink-0 rounded-md border border-border/60"
          style={{ backgroundColor: isHex ? value : "transparent" }}
        />
      </div>
    </QrField>
  );
}
