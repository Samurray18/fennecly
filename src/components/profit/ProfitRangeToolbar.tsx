import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { localDateKey, presetRange, type RangePreset, type RangeValue } from "@/lib/profit/range";

const PRESETS: Exclude<RangePreset, "custom">[] = [
  "today",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
];

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function ProfitRangeToolbar({
  value,
  onChange,
}: {
  value: RangeValue;
  onChange: (v: RangeValue) => void;
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ar") ?? false;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: parseKey(value.from),
    to: parseKey(value.to),
  });

  const label = (p: RangePreset) => t(`dashboard.profit.ranges.${p}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange({ preset: p, ...presetRange(p) })}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              value.preset === p
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label(p)}
          </button>
        ))}
      </div>

      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft({ from: parseKey(value.from), to: parseKey(value.to) });
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn("gap-2", value.preset === "custom" && "border-primary text-foreground")}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {value.preset === "custom" ? `${value.from} → ${value.to}` : label("custom")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end" dir={isRtl ? "rtl" : undefined}>
          <Calendar
            mode="range"
            numberOfMonths={2}
            defaultMonth={draft?.from}
            selected={draft}
            onSelect={setDraft}
          />
          <div className="flex items-center justify-between gap-2 border-t p-3">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t("dashboard.profit.rangePicker.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!draft?.from || !draft?.to}
              onClick={() => {
                if (!draft?.from || !draft?.to) return;
                onChange({
                  preset: "custom",
                  from: localDateKey(draft.from),
                  to: localDateKey(draft.to),
                });
                setOpen(false);
              }}
            >
              {t("dashboard.profit.rangePicker.apply")}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
