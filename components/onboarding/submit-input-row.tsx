"use client";

import * as React from "react";
import { SendButtonIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Single-line "type an answer, then submit" row — text/number/date input and
 * the gradient send button live inside one bordered pill (matching the goal
 * composer's box), not two separate boxes with a gap between them.
 */
export interface SubmitInputRowProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  ariaLabel: string;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  autoFocus?: boolean;
  min?: string;
  className?: string;
}

export function SubmitInputRow({
  value,
  onChange,
  onSubmit,
  placeholder,
  ariaLabel,
  type = "text",
  inputMode,
  disabled,
  autoFocus,
  min,
  className,
}: SubmitInputRowProps) {
  return (
    <div
      className={cn(
        "focus-gradient-ring flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-surface py-2 pl-5 pr-2",
        className
      )}
    >
      <input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSubmit()}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        min={min}
        disabled={disabled}
        className="min-w-0 flex-1 bg-transparent text-[17px] text-foreground placeholder:text-muted-dim focus:outline-none disabled:opacity-60"
      />
      <button
        type="button"
        aria-label="Submit"
        onClick={onSubmit}
        disabled={disabled || !value.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
      >
        <SendButtonIcon className="h-11 w-11" />
      </button>
    </div>
  );
}
