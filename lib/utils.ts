import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class lists safely (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * The single source of truth mapping a stored currency code (User.currency,
 * always a 3-letter ISO-ish code like "NGN") to the symbol shown in the UI.
 * Also drives the Settings currency picker's chip labels, so the two never
 * drift out of sync.
 */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  NGN: "\u20a6",
  GBP: "\u00a3",
  EUR: "\u20ac",
  GHS: "\u20b5",
  KES: "KSh",
  ZAR: "R",
  CAD: "$",
  AUD: "$",
  INR: "\u20b9",
};

/** Format a number as a whole-unit currency string, e.g. (20000, "NGN") -> "\u20a620,000". */
export function formatCurrency(value: number, currency: string = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${Math.round(value).toLocaleString("en-US")}`;
}

/** Format a signed currency delta, e.g. (2230, "NGN") -> "+\u20a62,230" / (-20, "NGN") -> "-\u20a620". */
export function formatSignedCurrency(value: number, currency: string = "USD"): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const sign = value < 0 ? "-" : "+";
  return `${sign}${symbol}${Math.abs(Math.round(value)).toLocaleString("en-US")}`;
}

/** Time-of-day aware greeting, e.g. "Good evening". */
export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Goal-deadline label, e.g. "6 months left", "Due in 3 days", "Overdue by 2 weeks". */
export function formatDeadline(iso: string, now: Date = new Date()): string {
  const deadline = new Date(iso);
  const diffDays = Math.round((deadline.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    const overdue = Math.abs(diffDays);
    if (overdue < 14) return `Overdue by ${overdue} day${overdue === 1 ? "" : "s"}`;
    const weeks = Math.round(overdue / 7);
    if (weeks < 8) return `Overdue by ${weeks} week${weeks === 1 ? "" : "s"}`;
    const months = Math.round(overdue / 30);
    return `Overdue by ${months} month${months === 1 ? "" : "s"}`;
  }
  if (diffDays === 0) return "Due today";
  if (diffDays < 14) return `Due in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
  if (diffDays < 60) return `${Math.round(diffDays / 7)} weeks left`;
  if (diffDays < 365) return `${Math.round(diffDays / 30)} months left`;
  const years = Math.round(diffDays / 365);
  return `${years} year${years === 1 ? "" : "s"} left`;
}

/**
 * Cleans up a stored insight title for display. Older/on-demand rows are
 * titled "Insight: <focus>" where <focus> is an internal snake_case enum
 * value (see request_insight's focus schema) — strip that prefix and
 * humanize the remainder so it reads naturally (e.g. "Insight: goal_progress"
 * -> "Goal progress") instead of leaking internal identifiers.
 */
export function humanizeInsightTitle(title: string): string {
  const stripped = title.replace(/^Insight:\s*/i, "");
  if (stripped === title) return title;
  return stripped
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
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
