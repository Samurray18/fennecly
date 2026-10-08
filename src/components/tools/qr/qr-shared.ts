import { z } from "zod";

export type QrType = "url" | "whatsapp" | "text" | "wifi" | "phone" | "email";
export type QrErrorCorrection = "L" | "M" | "Q" | "H";
export type QrWifiSecurity = "WPA" | "WEP" | "none";

export type QrFormState = {
  type: QrType;
  url: string;
  waPhone: string;
  waMessage: string;
  text: string;
  ssid: string;
  wifiPassword: string;
  wifiSecurity: QrWifiSecurity;
  phone: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  fg: string;
  bg: string;
  size: number;
  errorCorrection: QrErrorCorrection;
  logoDataUrl: string | null;
};

export const defaultQrState: QrFormState = {
  type: "url",
  url: "",
  waPhone: "+213 555 12 34 56",
  waMessage: "",
  text: "",
  ssid: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  phone: "+213 555 12 34 56",
  email: "",
  emailSubject: "",
  emailBody: "",
  fg: "#0b0a14",
  bg: "#ffffff",
  size: 512,
  errorCorrection: "M",
  logoDataUrl: null,
};

export const QR_TYPES: QrType[] = ["url", "whatsapp", "text", "wifi", "phone", "email"];
export const ERROR_CORRECTION_LEVELS: QrErrorCorrection[] = ["L", "M", "Q", "H"];
export const WIFI_SECURITY: QrWifiSecurity[] = ["WPA", "WEP", "none"];

/** Byte capacity per error correction level (byte mode), used to fail early. */
const MAX_BYTES: Record<QrErrorCorrection, number> = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export type QrErrors = Partial<Record<keyof QrFormState, string>>;

export function normalizeUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function isValidUrl(raw: string): boolean {
  try {
    const parsed = new URL(normalizeUrl(raw));
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      parsed.hostname.includes(".") &&
      parsed.hostname.length > 3
    );
  } catch {
    return false;
  }
}

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  return digits;
}

function isValidPhone(raw: string): boolean {
  const digits = normalizePhone(raw);
  return digits.length >= 8 && digits.length <= 15;
}

function isValidEmail(raw: string): boolean {
  const value = raw.trim();
  if (value.length > 320 || /\s/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64) return false;
  if (!domain || domain.length > 253) return false;
  if (!/^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+$/i.test(local)) return false;
  if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) return false;
  return true;
}

/** Wi-Fi payloads use `;` and `,` as separators, so they must be escaped. */
function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

export function buildQrPayload(state: QrFormState): string {
  switch (state.type) {
    case "url":
      return normalizeUrl(state.url);
    case "whatsapp": {
      const digits = normalizePhone(state.waPhone);
      const message = state.waMessage.trim();
      if (!digits) return "";
      return message
        ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${digits}`;
    }
    case "text":
      return state.text;
    case "wifi": {
      const security = state.wifiSecurity === "none" ? "nopass" : state.wifiSecurity;
      if (!state.ssid) return "";
      const password = state.wifiSecurity === "none" ? "" : escapeWifiValue(state.wifiPassword);
      return `WIFI:T:${security};S:${escapeWifiValue(state.ssid)};P:${password};H:false;;`;
    }
    case "phone": {
      const digits = normalizePhone(state.phone);
      return digits ? `tel:+${digits}` : "";
    }
    case "email": {
      const address = state.email.trim();
      if (!address) return "";
      const query: string[] = [];
      if (state.emailSubject.trim())
        query.push(`subject=${encodeURIComponent(state.emailSubject.trim())}`);
      if (state.emailBody.trim()) query.push(`body=${encodeURIComponent(state.emailBody.trim())}`);
      return query.length ? `mailto:${address}?${query.join("&")}` : `mailto:${address}`;
    }
  }
}

const qrStateSchema = z
  .object({
    type: z.enum(["url", "whatsapp", "text", "wifi", "phone", "email"]),
    url: z.string(),
    waPhone: z.string(),
    waMessage: z.string(),
    text: z.string(),
    ssid: z.string(),
    wifiPassword: z.string(),
    wifiSecurity: z.enum(["WPA", "WEP", "none"]),
    phone: z.string(),
    email: z.string(),
    emailSubject: z.string(),
    emailBody: z.string(),
    fg: z.string(),
    bg: z.string(),
    size: z.number(),
    errorCorrection: z.enum(["L", "M", "Q", "H"]),
    logoDataUrl: z.string().nullable(),
  })
  .superRefine((value, ctx) => {
    const fail = (path: keyof QrFormState, message: string) =>
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [path], message });

    switch (value.type) {
      case "url":
        if (!value.url.trim()) fail("url", "required");
        else if (!isValidUrl(value.url)) fail("url", "invalidUrl");
        break;
      case "whatsapp":
        if (!value.waPhone.trim()) fail("waPhone", "required");
        else if (!isValidPhone(value.waPhone)) fail("waPhone", "invalidPhone");
        break;
      case "text":
        if (!value.text.trim()) fail("text", "required");
        break;
      case "wifi":
        if (!value.ssid.trim()) fail("ssid", "required");
        else if (value.ssid.trim().length > 32) fail("ssid", "ssidTooLong");
        else if (value.wifiSecurity !== "none" && !value.wifiPassword)
          fail("wifiPassword", "required");
        break;
      case "phone":
        if (!value.phone.trim()) fail("phone", "required");
        else if (!isValidPhone(value.phone)) fail("phone", "invalidPhone");
        break;
      case "email":
        if (!value.email.trim()) fail("email", "required");
        else if (!isValidEmail(value.email)) fail("email", "invalidEmail");
        break;
    }

    if (!/^#[0-9a-f]{6}$/i.test(value.fg)) fail("fg", "invalidColor");
    if (!/^#[0-9a-f]{6}$/i.test(value.bg)) fail("bg", "invalidColor");
    if (value.fg.toLowerCase() === value.bg.toLowerCase()) fail("fg", "sameColor");

    if (value.size < 256 || value.size > 1024) fail("size", "invalidSize");

    const payload = buildQrPayload(value);
    if (payload) {
      const bytes = new TextEncoder().encode(payload).length;
      if (bytes > MAX_BYTES[value.errorCorrection]) fail("text", "tooLong");
    }
  });

export function validateQr(state: QrFormState): QrErrors {
  const result = qrStateSchema.safeParse(state);
  if (result.success) return {};

  const errors: QrErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !(key in errors)) {
      errors[key as keyof QrFormState] = issue.message;
    }
  }
  return errors;
}

/** A logo needs level H to survive having its centre covered. */
export function effectiveErrorCorrection(state: QrFormState): QrErrorCorrection {
  return state.logoDataUrl ? "H" : state.errorCorrection;
}

function parseHexColor(hex: string): [number, number, number] {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parseHexColor(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** 3:1 is the widely used minimum for a QR symbol to stay scannable. */
export function contrastRatio(fg: string, bg: string): number {
  const a = relativeLuminance(fg);
  const b = relativeLuminance(bg);
  const [lighter, darker] = a > b ? [a, b] : [b, a];
  return (lighter + 0.05) / (darker + 0.05);
}

export function hasLowContrast(fg: string, bg: string): boolean {
  if (!/^#[0-9a-f]{6}$/i.test(fg) || !/^#[0-9a-f]{6}$/i.test(bg)) return false;
  return contrastRatio(fg, bg) < 3;
}

function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

/** Layers the uploaded logo over the centre of the symbol. */
export function drawLogo(ctx: CanvasRenderingContext2D, image: HTMLImageElement, size: number) {
  const box = Math.round(size * 0.26);
  const offset = Math.round((size - box) / 2);
  const radius = Math.round(box * 0.18);
  const padding = Math.round(box * 0.12);

  ctx.save();
  ctx.fillStyle = "#ffffff";
  roundedRectPath(ctx, offset, offset, box, box, radius);
  ctx.fill();

  const inner = box - padding * 2;
  const ratio = Math.min(inner / image.width, inner / image.height);
  const w = Math.max(1, Math.round(image.width * ratio));
  const h = Math.max(1, Math.round(image.height * ratio));
  ctx.drawImage(image, Math.round((size - w) / 2), Math.round((size - h) / 2), w, h);
  ctx.restore();
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("logo load failed"));
    image.src = src;
  });
}
