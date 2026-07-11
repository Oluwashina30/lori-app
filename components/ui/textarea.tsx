import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Reusable multi-line textarea sharing the same animated gradient-border
 * focus treatment as the chat composer (`.focus-gradient-ring`, defined
 * once in globals.css).
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows = 3, ...props }, ref) => {
    return (
      <div className="focus-gradient-ring rounded-xl border border-border-subtle bg-surface">
        <textarea
          ref={ref}
          rows={rows}
          className={cn(
            "w-full resize-none rounded-xl bg-transparent px-4 py-2.5 text-[15px] text-foreground placeholder:text-muted-dim focus:outline-none",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
