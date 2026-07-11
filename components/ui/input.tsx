import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Reusable text/number/search input. Shares the exact same animated
 * gradient-border focus treatment as the chat composer's textarea
 * (`.focus-gradient-ring`, defined once in globals.css) so any input added
 * to the app automatically matches — no background change on focus, no
 * browser default outline, 200ms fade-in ring.
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <div className="focus-gradient-ring rounded-xl border border-border-subtle bg-surface">
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full rounded-xl bg-transparent px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted-dim focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
