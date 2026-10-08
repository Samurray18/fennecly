import { useTranslation } from "react-i18next";
import { Link2, Mail, MessageCircle, Phone, Type, Wifi, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrField } from "./qr-field";
import { QR_TYPES, WIFI_SECURITY } from "./qr-shared";
import type { QrErrors, QrFormState, QrType, QrWifiSecurity } from "./qr-shared";

const TYPE_ICONS: Record<QrType, LucideIcon> = {
  url: Link2,
  whatsapp: MessageCircle,
  text: Type,
  wifi: Wifi,
  phone: Phone,
  email: Mail,
};

type QrOptionsFormProps = {
  state: QrFormState;
  errors: QrErrors;
  onChange: (patch: Partial<QrFormState>) => void;
};

export function QrOptionsForm({ state, errors, onChange }: QrOptionsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5">
      <h2 className="mb-4 font-display text-base font-semibold">{t("tools.qr.form.title")}</h2>

      <Tabs value={state.type} onValueChange={(value) => onChange({ type: value as QrType })}>
        <div className="-mx-1 overflow-x-auto px-1 pb-1">
          <TabsList className="w-max">
            {QR_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type];
              return (
                <TabsTrigger key={type} value={type} className="gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {t(`tools.qr.types.${type}`)}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="url" className="space-y-4">
          <QrField
            id="qr-url"
            label={t("tools.qr.fields.url")}
            error={errors.url}
            hint={t("tools.qr.fields.urlHint")}
          >
            <Input
              id="qr-url"
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder={t("tools.qr.placeholders.url")}
              value={state.url}
              onChange={(event) => onChange({ url: event.target.value })}
            />
          </QrField>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <QrField
            id="qr-wa-phone"
            label={t("tools.qr.fields.whatsappPhone")}
            error={errors.waPhone}
            hint={t("tools.qr.fields.whatsappPhoneHint")}
          >
            <Input
              id="qr-wa-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("tools.qr.placeholders.phone")}
              value={state.waPhone}
              onChange={(event) => onChange({ waPhone: event.target.value })}
            />
          </QrField>
          <QrField
            id="qr-wa-message"
            label={t("tools.qr.fields.whatsappMessage")}
            error={errors.waMessage}
            hint={t("tools.qr.fields.whatsappMessageHint")}
          >
            <Textarea
              id="qr-wa-message"
              rows={3}
              placeholder={t("tools.qr.placeholders.whatsappMessage")}
              value={state.waMessage}
              onChange={(event) => onChange({ waMessage: event.target.value })}
            />
          </QrField>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <QrField
            id="qr-text"
            label={t("tools.qr.fields.text")}
            error={errors.text}
            hint={t("tools.qr.fields.textHint")}
          >
            <Textarea
              id="qr-text"
              rows={5}
              placeholder={t("tools.qr.placeholders.text")}
              value={state.text}
              onChange={(event) => onChange({ text: event.target.value })}
            />
          </QrField>
        </TabsContent>

        <TabsContent value="wifi" className="space-y-4">
          <QrField
            id="qr-ssid"
            label={t("tools.qr.fields.ssid")}
            error={errors.ssid}
            hint={t("tools.qr.fields.ssidHint")}
          >
            <Input
              id="qr-ssid"
              type="text"
              autoComplete="off"
              placeholder={t("tools.qr.placeholders.ssid")}
              value={state.ssid}
              onChange={(event) => onChange({ ssid: event.target.value })}
            />
          </QrField>

          <QrField
            id="qr-wifi-security"
            label={t("tools.qr.fields.wifiSecurity")}
            error={errors.wifiSecurity}
          >
            <QrSegmented
              ariaLabel={t("tools.qr.fields.wifiSecurity")}
              value={state.wifiSecurity}
              options={WIFI_SECURITY}
              labels={{
                WPA: t("tools.qr.wifi.wpa"),
                WEP: t("tools.qr.wifi.wep"),
                none: t("tools.qr.wifi.none"),
              }}
              onChange={(value: QrWifiSecurity) => onChange({ wifiSecurity: value })}
            />
          </QrField>

          {state.wifiSecurity !== "none" && (
            <QrField
              id="qr-wifi-password"
              label={t("tools.qr.fields.wifiPassword")}
              error={errors.wifiPassword}
              hint={t("tools.qr.fields.wifiPasswordHint")}
            >
              <Input
                id="qr-wifi-password"
                type="password"
                autoComplete="off"
                placeholder={t("tools.qr.placeholders.wifiPassword")}
                value={state.wifiPassword}
                onChange={(event) => onChange({ wifiPassword: event.target.value })}
              />
            </QrField>
          )}
        </TabsContent>

        <TabsContent value="phone" className="space-y-4">
          <QrField
            id="qr-phone"
            label={t("tools.qr.fields.phone")}
            error={errors.phone}
            hint={t("tools.qr.fields.phoneHint")}
          >
            <Input
              id="qr-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder={t("tools.qr.placeholders.phone")}
              value={state.phone}
              onChange={(event) => onChange({ phone: event.target.value })}
            />
          </QrField>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <QrField
            id="qr-email"
            label={t("tools.qr.fields.email")}
            error={errors.email}
            hint={t("tools.qr.fields.emailHint")}
          >
            <Input
              id="qr-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={t("tools.qr.placeholders.email")}
              value={state.email}
              onChange={(event) => onChange({ email: event.target.value })}
            />
          </QrField>
          <QrField
            id="qr-email-subject"
            label={t("tools.qr.fields.emailSubject")}
            hint={t("tools.qr.fields.optionalHint")}
          >
            <Input
              id="qr-email-subject"
              type="text"
              placeholder={t("tools.qr.placeholders.emailSubject")}
              value={state.emailSubject}
              onChange={(event) => onChange({ emailSubject: event.target.value })}
            />
          </QrField>
          <QrField
            id="qr-email-body"
            label={t("tools.qr.fields.emailBody")}
            hint={t("tools.qr.fields.optionalHint")}
          >
            <Textarea
              id="qr-email-body"
              rows={3}
              placeholder={t("tools.qr.placeholders.emailBody")}
              value={state.emailBody}
              onChange={(event) => onChange({ emailBody: event.target.value })}
            />
          </QrField>
        </TabsContent>
      </Tabs>
    </div>
  );
}

type QrSegmentedProps<T extends string> = {
  value: T;
  options: readonly T[];
  labels: Record<T, string>;
  ariaLabel: string;
  onChange: (value: T) => void;
};

function QrSegmented<T extends string>({
  value,
  options,
  labels,
  ariaLabel,
  onChange,
}: QrSegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`grid gap-1 rounded-lg border border-border/60 bg-muted/40 p-1 ${
        options.length > 3 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3"
      }`}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={value === option}
          onClick={() => onChange(option)}
          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition-colors ${
            value === option
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  );
}
