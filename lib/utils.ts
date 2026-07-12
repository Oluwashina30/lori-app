import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists safely (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as a whole-dollar currency string, e.g. 20000 -> "$20,000". */
export function formatCurrency(value: number, currency: "$" | "\u20a6" = "$"): string {
  return `${currency}${Math.round(value).toLocaleString("en-US")}`;
}

/** Format a signed currency delta, e.g. 2230 -> "+$2,230" / -20 -> "-$20". */
export function formatSignedCurrency(value: number, currency: "$" | "\u20a6" = "$"): string {
  const sign = value < 0 ? "-" : "+";
  return `${sign}${currency}${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

/** Time-of-day aware greeting, e.g. "Good evening". */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Coarse relative-time label for history feeds, e.g. "3m ago", "Yesterday", "Jul 8". */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * The brand "heat" gradient used across progress visuals: violet -> pink ->
 * orange -> amber -> green. Defined once here so every progress component
 * (smooth bar, segmented bar, circular chart) stays perfectly in sync.
 */
export const HEAT_GRADIENT_STOPS: Array<{ stop: number; color: [number, number, number] }> = [
  { stop: 0, color: [124, 58, 237] }, // violet-600
  { stop: 0.28, color: [217, 70, 239] }, // fuchsia-500
  { stop: 0.5, color: [253, 72, 149] }, // brand pink (#FD4895)
  { stop: 0.68, color: [251, 146, 60] }, // orange-400
  { stop: 0.84, color: [250, 204, 21] }, // yellow-400
  { stop: 1, color: [74, 222, 128] }, // green-400
];

export const HEAT_GRADIENT_CSS = `linear-gradient(90deg, ${HEAT_GRADIENT_STOPS.map(
  (s) => `rgb(${s.color.join(",")}) ${s.stop * 100}%`
).join(", ")})`;

/** Linearly interpolate a color for position `t` (0-1) along the heat gradient. */
export function heatColorAt(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < HEAT_GRADIENT_STOPS.length - 1; i++) {
    const a = HEAT_GRADIENT_STOPS[i];
    const b = HEAT_GRADIENT_STOPS[i + 1];
    if (clamped >= a.stop && clamped <= b.stop) {
      const localT = (clamped - a.stop) / (b.stop - a.stop);
      const r = Math.round(a.color[0] + (b.color[0] - a.color[0]) * localT);
      const g = Math.round(a.color[1] + (b.color[1] - a.color[1]) * localT);
      const bch = Math.round(a.color[2] + (b.color[2] - a.color[2]) * localT);
      return `rgb(${r}, ${g}, ${bch})`;
    }
  }
  const last = HEAT_GRADIENT_STOPS[HEAT_GRADIENT_STOPS.length - 1].color;
  return `rgb(${last.join(",")})`;
}
