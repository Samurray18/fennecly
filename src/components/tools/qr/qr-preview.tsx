import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toString as qrToString, toCanvas } from "qrcode";
import { toast } from "sonner";
import { AlertTriangle, Copy, Download, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildQrPayload,
  drawLogo,
  effectiveErrorCorrection,
  hasLowContrast,
  loadImage,
} from "./qr-shared";
import type { QrFormState } from "./qr-shared";

type QrPreviewProps = {
  /** Debounced so the canvas does not regenerate on every keystroke. */
  state: QrFormState;
  valid: boolean;
};

function triggerDownload(href: string, filename: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** The centred logo is baked into the SVG so downloaded files match the preview. */
function injectLogo(svg: string, logoDataUrl: string): string {
  const match = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(svg);
  if (!match) return svg;
  const vw = Number(match[1]);
  const vh = Number(match[2]);
  if (!Number.isFinite(vw) || !Number.isFinite(vh) || vw <= 0 || vh <= 0) return svg;

  const box = vw * 0.26;
  const x = (vw - box) / 2;
  const y = (vh - box) / 2;
  const radius = box * 0.18;
  const padding = box * 0.12;
  const inner = box - padding * 2;

  const markup =
    `<rect x="${x}" y="${y}" width="${box}" height="${box}" rx="${radius}" fill="#ffffff"/>` +
    `<image href="${logoDataUrl}" x="${x + padding}" y="${y + padding}" width="${inner}" height="${inner}" preserveAspectRatio="xMidYMid meet"/>`;

  return svg.replace("</svg>", `${markup}</svg>`);
}

export function QrPreview({ state, valid }: QrPreviewProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);

  const payload = valid ? buildQrPayload(state) : "";
  const errorCorrection = effectiveErrorCorrection(state);
  const lowContrast = hasLowContrast(state.fg, state.bg);

  useEffect(() => {
    let cancelled = false;
    if (!state.logoDataUrl) {
      setLogoImage(null);
      return;
    }
    loadImage(state.logoDataUrl)
      .then((image) => {
        if (!cancelled) setLogoImage(image);
      })
      .catch(() => {
        if (!cancelled) setLogoImage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [state.logoDataUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!payload) {
      setGenerateError(null);
      return;
    }

    let cancelled = false;
    toCanvas(canvas, payload, {
      width: state.size,
      margin: 4,
      errorCorrectionLevel: errorCorrection,
      color: { dark: state.fg, light: state.bg },
    })
      .then(() => {
        if (cancelled) return;
        if (logoImage) {
          const ctx = canvas.getContext("2d");
          if (ctx) drawLogo(ctx, logoImage, canvas.width);
        }
        setGenerateError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setGenerateError(error instanceof Error ? error.message : String(error));
      });

    return () => {
      cancelled = true;
    };
  }, [payload, state.size, state.fg, state.bg, errorCorrection, logoImage]);

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload || generateError) return;
    try {
      triggerDownload(canvas.toDataURL("image/png"), "fennecly-qr-code.png");
    } catch {
      toast.error(t("tools.qr.output.downloadFailed"));
    }
  };

  const downloadSvg = async () => {
    if (!payload) return;
    try {
      const svg = await qrToString(payload, {
        type: "svg",
        margin: 4,
        errorCorrectionLevel: errorCorrection,
        color: { dark: state.fg, light: state.bg },
      });
      const finalSvg = state.logoDataUrl ? injectLogo(svg, state.logoDataUrl) : svg;
      const url = URL.createObjectURL(
        new Blob([finalSvg], { type: "image/svg+xml;charset=utf-8" }),
      );
      triggerDownload(url, "fennecly-qr-code.svg");
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      toast.error(t("tools.qr.output.downloadFailed"));
    }
  };

  const copyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      const hasImageClipboard =
        blob && typeof ClipboardItem !== "undefined" && navigator.clipboard?.write !== undefined;

      if (hasImageClipboard) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        toast.success(t("tools.qr.output.imageCopied"));
        return;
      }
      await navigator.clipboard.writeText(payload);
      toast.success(t("tools.qr.output.textCopied"));
    } catch {
      toast.error(t("tools.qr.output.copyFailed"));
    }
  };

  const disabled = !payload || Boolean(generateError);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold">{t("tools.qr.preview.title")}</h2>
        <span className="text-xs tabular-nums text-muted-foreground">
          {state.size} × {state.size}px
        </span>
      </div>

      <div className="flex min-h-64 items-center justify-center rounded-xl bg-muted/40 p-4">
        {payload && !generateError ? (
          <canvas
            ref={canvasRef}
            aria-label={t("tools.qr.preview.canvasLabel")}
            className="h-auto max-w-full rounded-lg shadow-sm"
            style={{ width: state.size, maxWidth: "100%", imageRendering: "pixelated" }}
          />
        ) : (
          <div className="text-center">
            <div
              className={cn(
                "mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed",
                "border-border text-muted-foreground",
              )}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 14h3v3h-3zM18.5 18.5H21V21h-2.5z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">
              {generateError
                ? t("tools.qr.preview.generateError")
                : t("tools.qr.preview.placeholder")}
            </p>
          </div>
        )}
      </div>

      {lowContrast && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>{t("tools.qr.preview.lowContrast")}</p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="outline" size="sm" onClick={downloadPng} disabled={disabled}>
          <Download className="h-4 w-4" />
          {t("tools.qr.output.png")}
        </Button>
        <Button variant="outline" size="sm" onClick={downloadSvg} disabled={disabled}>
          <FileCode className="h-4 w-4" />
          {t("tools.qr.output.svg")}
        </Button>
        <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={disabled}>
          <Copy className="h-4 w-4" />
          {t("tools.qr.output.copy")}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{t("tools.qr.output.hint")}</p>
    </div>
  );
}
