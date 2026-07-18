"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SparkleIcon, AttachIcon, MicIcon, ImageAttachIcon, SendButtonIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface ChatComposerImage {
  /** Base64-encoded image bytes, no data-URL prefix. */
  data: string;
  mediaType: string;
}

export interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string, image?: ChatComposerImage | null) => void;
  placeholder?: string;
  label?: string;
  /** Hide the "✨ {label}" row above the field — e.g. once a chat conversation already has messages. Defaults to true. */
  showLabel?: boolean;
  /** Floor for the textarea's auto-resize height, in px. Defaults to the compact dashboard sizing (64). */
  minHeight?: number;
}

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

// The Web Speech API is unstandardized — Chrome/Edge/Safari only expose it
// under the vendor-prefixed global, and there's no @types coverage for it.
type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "I spent 5000 on food",
  label = "Tell me about today.",
  showLabel = true,
  minHeight = 64,
}: ChatComposerProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recognitionRef = React.useRef<SpeechRecognitionInstance | null>(null);
  const baseValueRef = React.useRef(""); // value at the moment dictation started, so interim results replace rather than duplicate

  const [image, setImage] = React.useState<(ChatComposerImage & { previewUrl: string }) | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [speechSupported, setSpeechSupported] = React.useState(false);

  React.useEffect(() => {
    setSpeechSupported(getSpeechRecognitionCtor() !== null);
  }, []);

  React.useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  // Stop any in-flight dictation on unmount so it doesn't keep the mic hot.
  React.useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  function handleSubmit() {
    if (!value.trim() && !image) return;
    onSubmit(value.trim(), image ? { data: image.data, mediaType: image.mediaType } : null);
    if (image) {
      URL.revokeObjectURL(image.previewUrl);
      setImage(null);
    }
    setImageError(null);
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are supported right now.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("That image is over 4MB — try a smaller one.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [, base64] = dataUrl.split(",");
      setImageError(null);
      setImage({ data: base64, mediaType: file.type, previewUrl: URL.createObjectURL(file) });
    };
    reader.onerror = () => setImageError("Couldn't read that image — try again.");
    reader.readAsDataURL(file);
  }

  function removeImage() {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    setImageError(null);
  }

  function toggleDictation() {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    baseValueRef.current = value ? `${value} ` : "";

    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onChange(`${baseValueRef.current}${transcript}`);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
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

      <div className={cn("focus-gradient-ring rounded-2xl border border-border-subtle bg-surface p-5")}>
        <AnimatePresence initial={false}>
          {image && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral local object URL, not a static/remote asset */}
                <img src={image.previewUrl} alt="Attached" className="h-16 w-16 rounded-lg object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  aria-label="Remove attached image"
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated text-foreground shadow-sm ring-1 ring-border-subtle transition-colors hover:bg-negative hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
          placeholder={isRecording ? "Listening…" : `“ ${placeholder} ”`}
          aria-label="Describe today's financial activity"
          style={{ minHeight }}
          className="w-full resize-none bg-transparent text-[15px] text-foreground placeholder:italic placeholder:text-muted-dim focus:outline-none"
        />

        {imageError && <p className="mt-1 text-[12.5px] text-negative">{imageError}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelected}
          className="hidden"
        />

        <div className="flex items-center justify-end gap-1.5 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach a photo"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted transition-transform duration-150 hover:scale-110 hover:text-foreground"
          >
            <AttachIcon className="h-[18px] w-[18px]" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isRecording ? "Stop recording" : "Record voice note"}
            onClick={toggleDictation}
            disabled={!speechSupported}
            title={speechSupported ? undefined : "Voice input isn't supported in this browser"}
            className={cn(
              "text-muted transition-transform duration-150 hover:scale-110 hover:text-foreground",
              isRecording && "text-negative hover:text-negative"
            )}
          >
            <motion.span
              animate={isRecording ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 1, repeat: isRecording ? Infinity : 0, ease: "easeInOut" }}
              className="flex"
            >
              <MicIcon className="h-[18px] w-[18px]" />
            </motion.span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Attach an image"
            onClick={() => fileInputRef.current?.click()}
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
