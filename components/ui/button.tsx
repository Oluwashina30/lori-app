"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.02] active:scale-[0.97]",
  {
    variants: {
      variant: {
        /** Solid brand gradient, e.g. the send button. */
        gradient:
          "bg-[linear-gradient(160deg,var(--accent-from)_0%,var(--accent-via)_55%,var(--accent-to)_100%)] text-white shadow-[0_4px_16px_-4px_rgba(234,7,7,0.5)] hover:brightness-110",
        /** Gradient-bordered pill on a dark surface, e.g. "Ask AI" — shares the AI Insight card's living shimmer, with a glow scaled down for its size. */
        outline:
          "ai-glow-border-sm relative bg-background text-foreground border border-transparent [background:linear-gradient(var(--background),var(--background))_padding-box,linear-gradient(120deg,var(--accent-from),var(--accent-to))_border-box] hover:brightness-125",
        /** Solid white pill with gradient text, e.g. "Apply Recommendations". */
        white:
          "bg-white text-accent-solid hover:bg-white/90 shadow-sm",
        /** Muted pill chip, e.g. suggestion chips. */
        chip: "border border-border-subtle bg-surface text-muted hover:text-foreground hover:border-border-strong",
        ghost: "text-muted hover:text-foreground hover:bg-white/5",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-8 px-3.5 text-[13px]",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9 shrink-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
