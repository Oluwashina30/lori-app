"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Same SSR-safe "are we on the client yet" pattern as the sidebar's
// portal-rendered collapsed-nav tooltip (components/layout/sidebar.tsx).
function useHasMounted(): boolean {
  return React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export interface DeleteAccountDialogProps {
  open: boolean;
  email: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Portal-rendered confirmation modal for the one truly destructive action
 * in Settings — requires typing the account's own email back before the
 * Delete button unlocks, the standard "can't fat-finger this" pattern for
 * irreversible deletes.
 */
export function DeleteAccountDialog({ open, email, onCancel, onConfirm, loading, error }: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = React.useState("");
  const mounted = useHasMounted();

  function handleCancel() {
    setConfirmText("");
    onCancel();
  }

  if (!mounted) return null;

  const canConfirm = confirmText.trim().toLowerCase() === email.toLowerCase();

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={loading ? undefined : handleCancel}
            aria-hidden
          />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="w-full max-w-md rounded-2xl border border-negative/30 bg-surface p-6 shadow-2xl shadow-black/60">
              <h2 id="delete-account-title" className="text-[17px] font-semibold text-foreground">
                Delete your account
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                This permanently deletes your goals, transactions, chat history, and every AI insight. This
                can&apos;t be undone.
              </p>

              <label className="mt-5 block text-[13px] font-medium text-muted" htmlFor="delete-confirm-input">
                Type <span className="text-foreground">{email}</span> to confirm
              </label>
              <div className="mt-2">
                <Input
                  id="delete-confirm-input"
                  type="email"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  disabled={loading}
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {error && (
                <p className="mt-3 text-[13px] text-negative" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!canConfirm || loading}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-negative px-5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading ? "Deleting…" : "Delete account"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
