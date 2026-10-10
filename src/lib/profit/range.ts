/** Local calendar date key, "YYYY-MM-DD". */
export function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type RangePreset = "today" | "last7" | "last30" | "thisMonth" | "lastMonth" | "custom";

export type RangeValue = { preset: RangePreset; from: string; to: string };

/** Compute an inclusive date range for a preset, in local time. */
export function presetRange(
  preset: Exclude<RangePreset, "custom">,
  now: Date = new Date(),
): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const today = new Date(y, m, d);

  switch (preset) {
    case "today":
      return { from: localDateKey(today), to: localDateKey(today) };
    case "last7":
      return { from: localDateKey(new Date(y, m, d - 6)), to: localDateKey(today) };
    case "last30":
      return { from: localDateKey(new Date(y, m, d - 29)), to: localDateKey(today) };
    case "thisMonth":
      return { from: localDateKey(new Date(y, m, 1)), to: localDateKey(today) };
    case "lastMonth":
      return { from: localDateKey(new Date(y, m - 1, 1)), to: localDateKey(new Date(y, m, 0)) };
  }
}
