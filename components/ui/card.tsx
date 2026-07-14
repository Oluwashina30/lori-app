"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders the brand gradient outline instead of the default subtle border, with a slow living shimmer + glow. */
  highlighted?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, highlighted, style, onMouseMove, ...props }, ref) => {
    // Tracks the cursor position as CSS custom properties so `.card-spotlight`
    // (globals.css) can paint a soft radial highlight that follows the mouse
    // — pure CSS custom-property + background update, no animation loop.
    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
      const rect = event.currentTarget.getBoundingClientRect();
      event.currentTarget.style.setProperty("--spot-x", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      event.currentTarget.style.setProperty("--spot-y", `${((event.clientY - rect.top) / rect.height) * 100}%`);
      onMouseMove?.(event);
    }

    return (
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        className={cn(
          "card-spotlight rounded-2xl border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30",
          highlighted
            ? "ai-glow-border border border-transparent [background:linear-gradient(var(--surface),var(--surface))_padding-box,linear-gradient(165deg,#FD5B2E_0%,#EA3B1F_100%)_border-box]"
            : "border-border-subtle hover:border-border-strong",
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-[15px] font-medium text-foreground", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export { Card, CardTitle };
