import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

/** "Lori" wordmark, brand asset at public/icons/lori-logo.svg. */
export function Logo({ className }: LogoProps) {
  return <img src="/icons/lori-logo.svg" alt="Lori" width={80} height={36} className={cn("h-9 w-auto", className)} />;
}
