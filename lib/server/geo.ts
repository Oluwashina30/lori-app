import { headers } from "next/headers";

// Curated, not exhaustive — covers the currencies this app's onboarding/
// dashboard copy already anticipates (NGN, USD) plus the most common
// markets. Unrecognized/missing country codes fall back to USD.
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  CA: "CAD",
  AU: "AUD",
  IN: "INR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  IE: "EUR",
  NL: "EUR",
  PT: "EUR",
};

/**
 * Best-effort default currency from the visitor's IP, via the
 * `x-vercel-ip-country` header Vercel's edge network stamps onto every
 * request in production. Absent entirely in local dev (no Vercel edge in
 * front of `next dev`), where this quietly falls back to USD — there's no
 * IP geolocation to fall back to outside of Vercel's production network.
 *
 * Only meant to be read once, at account-creation time (ensureUserRecord)
 * to seed a sensible default — after that, currency is just a normal user
 * preference the person can change from Settings.
 */
export async function detectCurrencyFromRequest(): Promise<string> {
  const country = (await headers()).get("x-vercel-ip-country");
  if (!country) return "USD";
  return COUNTRY_TO_CURRENCY[country.toUpperCase()] ?? "USD";
}
