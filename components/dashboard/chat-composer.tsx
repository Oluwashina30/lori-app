"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SparkleIcon, AttachIcon, MicIcon, ImageAttachIcon, SendButtonIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  label?: string;
  /** Hide the "✨ {label}" row above the field — e.g. once a chat conversation already has messages. Defaults to true. */
  showLabel?: boolean;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "I spent 5000 on food",
  label = "Tell me about today.",
  showLabel = true,
}: ChatComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  function handleSubmit() {
    if (!value.trim()) return;
    onSubmit(value.trim());
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {showLabel && (
        <div className="mb-3 flex items-center gap-2">
          <SparkleIcon className="h-4 w-4" />
          <span className="text-[15px] font-medium text-foreground">{label}</span>
        </div>
      )}

      <div
        className={cn(
          "focus-gradient-ring rounded-2xl border border-border-subtle bg-surface p-5"
        )}
      >
        <textarea
          ref={textareaRef}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={`\u201c ${placeholder} \u201d`}
          aria-label="Describe today's financial activity"
          className="min-h-[64px] w-full resize-none bg-transparent text-[15px] text-foreground placeholder:italic placeholder:text-muted-dim focus:outline-none"
        />

        <div className="flex items-center justify-end gap-1.5 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach a file"
            className="text-muted transition-transform duration-150 hover:scale-110 hover:text-foreground"
          >
            <AttachIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Record voice note"
            className="text-muted transition-transform duration-150 hover:scale-110 hover:text-foreground"
          >
            <MicIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach an image"
            className="text-muted transition-transform duration-150 hover:scale-110 hover:text-foreground"
          >
            <ImageAttachIcon className="h-[18px] w-[18px]" />
          </Button>
          <button
            type="button"
            aria-label="Send message"
            onClick={handleSubmit}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-110 hover:brightness-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <SendButtonIcon className="h-9 w-9" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
