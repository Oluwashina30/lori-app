import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

/**
 * Lori brand mark, asset at public/icons/lori-logo.svg. Defaults to a
 * height that fits the collapsed sidebar rail (88px wide, ~60px of
 * content width after padding — see lib/sidebar-constants.ts) without
 * overflowing; override className for contexts with more room.
 */
export function Logo({ className }: LogoProps) {
  return <img src="/icons/lori-logo.svg" alt="Lori" width={36} height={32} className={cn("h-6 w-auto", className)} />;
}
