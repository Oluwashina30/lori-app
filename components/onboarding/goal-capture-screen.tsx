"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { AttachIcon, MicIcon, ImageAttachIcon, SendButtonIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SelectableCard } from "@/components/onboarding/selectable";
import { GOAL_CATEGORIES } from "@/lib/goal-categories";
import { cn } from "@/lib/utils";
import type { GoalCategory } from "@/lib/types";

export interface GoalCaptureScreenProps {
  userName: string;
  onSelectCard: (category: GoalCategory) => void;
  onSubmitMessage: (message: string) => void;
  loading: boolean;
}

export function GoalCaptureScreen({ userName, onSelectCard, onSubmitMessage, loading }: GoalCaptureScreenProps) {
  const [message, setMessage] = React.useState("");
  const [selected, setSelected] = React.useState<GoalCategory | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  function handleSelectCard(category: GoalCategory) {
    if (loading || selected) return;
    setSelected(category);
    onSelectCard(category);
  }

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [message]);

  function handleSubmit() {
    if (!message.trim() || loading) return;
    onSubmitMessage(message.trim());
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]"
      >
        Welcome {userName}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="mt-2 text-[15px] text-muted"
      >
        Choose your biggest goal for now, or just tell me about it below — you can always add more later.
      </motion.p>

      <div className="mt-10 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        {GOAL_CATEGORIES.map((card, i) => (
          <SelectableCard
            key={card.category}
            icon={card.icon}
            label={card.label}
            selected={selected === card.category}
            disabled={loading || (selected !== null && selected !== card.category)}
            onClick={() => handleSelectCard(card.category)}
            delay={0.1 + i * 0.04}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "focus-gradient-ring mt-6 w-full rounded-2xl border border-border-subtle bg-surface p-5 text-left"
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={loading}
          placeholder="I want to travel to Japan next spring..."
          aria-label="Describe your goal in your own words"
          className="min-h-[28px] w-full resize-none bg-transparent text-[15px] text-foreground placeholder:text-muted-dim focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-end gap-1.5 pt-3">
          <Button type="button" variant="ghost" size="icon" aria-label="Attach a file" className="text-muted">
            <AttachIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Record voice note" className="text-muted">
            <MicIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Attach an image" className="text-muted">
            <ImageAttachIcon className="h-[18px] w-[18px]" />
          </Button>
          <button
            type="button"
            aria-label="Submit"
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 hover:scale-110 hover:brightness-110 active:scale-95 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-solid/60"
          >
            <SendButtonIcon className="h-9 w-9" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
