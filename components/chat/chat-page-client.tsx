"use client";

import * as React from "react";
import { AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { GreetingSection } from "@/components/dashboard/greeting-section";
import { ChatComposer } from "@/components/dashboard/chat-composer";
import { SuggestionChips } from "@/components/dashboard/suggestion-chips";
import { UserMessage } from "@/components/chat/user-message";
import { AssistantMessage } from "@/components/chat/assistant-message";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { mapChatResponseToBlocks, formatChatTimestamp } from "@/lib/mock-chat";
import { sendChatMessage } from "@/lib/api-client";
import type { ChatMessage, ChatSuggestion, UserProfile } from "@/lib/types";

export interface ChatPageClientProps {
  user: UserProfile;
  greetingSubtitle: string;
  suggestions: ChatSuggestion[];
}

export function ChatPageClient({ user, greetingSubtitle, suggestions }: ChatPageClientProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [composerValue, setComposerValue] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const hasMessages = messages.length > 0;

  function handleSuggestionSelect(suggestion: ChatSuggestion) {
    setComposerValue(suggestion.label);
  }

  // Picks up a message handed off from the dashboard composer (see
  // dashboard-shell.tsx's handleSubmit) and sends it immediately on arrival.
  React.useEffect(() => {
    const pending = sessionStorage.getItem("lori:pending-message");
    if (pending) {
      sessionStorage.removeItem("lori:pending-message");
      handleSubmit(pending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(value: string) {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: value,
      timestamp: formatChatTimestamp(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setComposerValue("");
    setIsTyping(true);

    try {
      const response = await sendChatMessage(value);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        blocks: mapChatResponseToBlocks(response),
        timestamp: formatChatTimestamp(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("chat request failed:", err);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        blocks: [{ kind: "insight", text: "Something went wrong reaching the server — try again in a moment." }],
        timestamp: formatChatTimestamp(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }

  const composerBlock = (
    <div className="flex w-full flex-col gap-4">
      <ChatComposer
        value={composerValue}
        onChange={setComposerValue}
        onSubmit={handleSubmit}
        label="What happened today?"
        placeholder={hasMessages ? "I spent 5000 on food" : "Tell me anything about money"}
        showLabel={!hasMessages}
      />
      <SuggestionChips suggestions={suggestions} onSelect={handleSuggestionSelect} />
    </div>
  );

  return (
    <AppShell user={user} contentClassName="flex flex-1 flex-col gap-8">
      {hasMessages ? (
        <>
          <div className="flex flex-col gap-6">
            {messages.map((message) =>
              message.role === "user" ? (
                <UserMessage key={message.id} message={message} user={user} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            )}
            <AnimatePresence>{isTyping && <TypingIndicator key="typing" />}</AnimatePresence>
          </div>

          {composerBlock}
        </>
      ) : (
        // Empty-state landing: greeting + composer centered together in the
        // middle of the available space, ChatGPT/Claude-style, rather than
        // pinned to the top — the greeting text itself is centered too.
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="text-center">
            <GreetingSection name={user.name} subtitle={greetingSubtitle} />
          </div>
          {composerBlock}
        </div>
      )}
    </AppShell>
  );
}
