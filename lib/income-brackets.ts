import { CURRENCY_SYMBOLS } from "@/lib/utils";

export interface IncomeBracket {
  /** Currency-agnostic tier id ("tier_1".."tier_5", or "skip") — stable across currencies so a
   *  changed Settings currency never invalidates an already-stored bracket key. */
  key: string;
  label: string;
  /** Representative monthly income for this tier, in the given currency — null for "skip". */
  midpoint: number | null;
}

// [min, max | null (open-ended), midpoint], 5 tiers per currency, roughly
// proportional round-number monthly-income bands for that currency/region —
// not live FX-converted (no exchange-rate dependency/failure mode), just a
// sensible per-currency scale so the brackets read as plausible wherever the
// person actually lives, matching their IP-detected (or Settings-chosen)
// currency from lib/server/geo.ts.
const TIER_RANGES: Record<string, [number, number | null, number][]> = {
  USD: [
    [0, 500, 375],
    [500, 2000, 1250],
    [2000, 5000, 3500],
    [5000, 10000, 7500],
    [10000, null, 12500],
  ],
  CAD: [
    [0, 500, 375],
    [500, 2500, 1500],
    [2500, 6000, 4250],
    [6000, 12000, 9000],
    [12000, null, 15000],
  ],
  AUD: [
    [0, 500, 375],
    [500, 2500, 1500],
    [2500, 6000, 4250],
    [6000, 12000, 9000],
    [12000, null, 15000],
  ],
  GBP: [
    [0, 500, 375],
    [500, 2000, 1250],
    [2000, 4000, 3000],
    [4000, 8000, 6000],
    [8000, null, 10000],
  ],
  EUR: [
    [0, 500, 375],
    [500, 2000, 1250],
    [2000, 4500, 3250],
    [4500, 9000, 6750],
    [9000, null, 11000],
  ],
  NGN: [
    [0, 150_000, 100_000],
    [150_000, 500_000, 325_000],
    [500_000, 1_500_000, 1_000_000],
    [1_500_000, 3_000_000, 2_250_000],
    [3_000_000, null, 4_000_000],
  ],
  GHS: [
    [0, 2_000, 1_500],
    [2_000, 6_000, 4_000],
    [6_000, 15_000, 10_000],
    [15_000, 30_000, 22_500],
    [30_000, null, 40_000],
  ],
  KES: [
    [0, 20_000, 15_000],
    [20_000, 60_000, 40_000],
    [60_000, 150_000, 105_000],
    [150_000, 300_000, 225_000],
    [300_000, null, 400_000],
  ],
  ZAR: [
    [0, 5_000, 3_500],
    [5_000, 15_000, 10_000],
    [15_000, 35_000, 25_000],
    [35_000, 70_000, 52_500],
    [70_000, null, 90_000],
  ],
  INR: [
    [0, 20_000, 15_000],
    [20_000, 60_000, 40_000],
    [60_000, 150_000, 105_000],
    [150_000, 300_000, 225_000],
    [300_000, null, 400_000],
  ],
};

function formatBound(value: number, symbol: string): string {
  return `${symbol}${value.toLocaleString("en-US")}`;
}

/** Ordered income brackets for a currency (falls back to USD's scale for an unrecognized code), plus a trailing "skip" option. */
export function getIncomeBrackets(currency: string): IncomeBracket[] {
  const ranges = TIER_RANGES[currency] ?? TIER_RANGES.USD;
  const symbol = CURRENCY_SYMBOLS[currency] ?? "$";

  const tiers: IncomeBracket[] = ranges.map(([min, max, midpoint], i) => ({
    key: `tier_${i + 1}`,
    label:
      max === null
        ? `More than ${formatBound(min, symbol)}`
        : min === 0
          ? `Less than ${formatBound(max, symbol)}`
          : `${formatBound(min, symbol)} - ${formatBound(max, symbol)}`,
    midpoint,
  }));

  return [...tiers, { key: "skip", label: "I'd rather not say", midpoint: null }];
}

/** Looks up a stored bracket key's representative monthly income for a given currency. */
export function incomeBracketMidpoint(currency: string, bracketKey: string | undefined): number | null {
  if (!bracketKey) return null;
  const bracket = getIncomeBrackets(currency).find((b) => b.key === bracketKey);
  return bracket?.midpoint ?? null;
}
