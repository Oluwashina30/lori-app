import { cn } from "@/lib/utils";

export interface LogoProps {
  className?: string;
}

/**
 * "Lori" wordmark — same brand gradient used by the primary button/progress
 * bar (--accent-from -> --accent-via -> --accent-to), clipped to the text.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn("text-xl font-extrabold italic tracking-tight", className)}
      style={{
        background: "linear-gradient(160deg, var(--accent-from) 0%, var(--accent-via) 55%, var(--accent-to) 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      Lori
    </span>
  );
}
