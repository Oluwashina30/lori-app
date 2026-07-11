"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import type { ChatMessage, UserProfile } from "@/lib/types";

export interface UserMessageProps {
  message: ChatMessage;
  user: UserProfile;
}

/** Right-aligned bubble for the person's own messages, matching the reference design. */
export function UserMessage({ message, user }: UserMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start justify-end gap-3"
    >
      <div className="flex max-w-[85%] items-baseline gap-3 rounded-2xl bg-surface-elevated px-5 py-3 sm:max-w-[70%]">
        <p className="text-[15px] text-foreground">{message.text}</p>
        <span className="shrink-0 text-[13px] text-muted-dim">{message.timestamp}</span>
      </div>
      <Avatar initials={user.initials} name={user.name} className="shrink-0" />
    </motion.div>
  );
}
