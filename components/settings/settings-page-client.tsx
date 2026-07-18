"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectableChip } from "@/components/onboarding/selectable";
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog";
import { useLogout } from "@/components/layout/sidebar";
import { updateUserSettings, deleteAccount } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
import { CURRENCY_SYMBOLS } from "@/lib/utils";
import type { RiskTolerance, UserProfile, UserSettings } from "@/lib/types";

// Derived from the same CURRENCY_SYMBOLS map that formatCurrency/
// formatSignedCurrency use everywhere amounts are displayed, so the
// picker's labels can never drift out of sync with what actually renders.
const CURRENCY_OPTIONS: { code: string; label: string }[] = Object.entries(CURRENCY_SYMBOLS).map(
  ([code, symbol]) => ({ code, label: `${symbol} ${code}` })
);

const RISK_OPTIONS: { value: RiskTolerance; label: string; hint: string }[] = [
  { value: "conservative", label: "Conservative", hint: "Smaller, steadier auto-save suggestions" },
  { value: "moderate", label: "Moderate", hint: "Balanced pace toward your goals" },
  { value: "aggressive", label: "Aggressive", hint: "Bigger pushes when you can afford it" },
];

export interface SettingsPageClientProps {
  user: UserProfile;
  initialSettings: UserSettings;
}

export function SettingsPageClient({ user, initialSettings }: SettingsPageClientProps) {
  const router = useRouter();
  const logout = useLogout();

  const [settings, setSettings] = React.useState(initialSettings);
  const [name, setName] = React.useState(initialSettings.name);
  const [currency, setCurrency] = React.useState(initialSettings.currency);
  const [riskTolerance, setRiskTolerance] = React.useState(initialSettings.riskTolerance);
  const [monthlyIncome, setMonthlyIncome] = React.useState(
    initialSettings.monthlyIncome != null ? String(initialSettings.monthlyIncome) : ""
  );

  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState<number | null>(null);

  const [showUpgradeNote, setShowUpgradeNote] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);

  const isDirty =
    name.trim() !== settings.name ||
    currency !== settings.currency ||
    riskTolerance !== settings.riskTolerance ||
    monthlyIncome !== (settings.monthlyIncome != null ? String(settings.monthlyIncome) : "");

  async function handleSave() {
    if (!isDirty || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const parsedIncome = monthlyIncome.trim() ? Number(monthlyIncome.replace(/[^0-9.]/g, "")) : null;
      const updated = await updateUserSettings({
        name: name.trim(),
        currency,
        riskTolerance,
        monthlyIncome: parsedIncome,
      });
      setSettings(updated);
      setSavedAt(Date.now());
    } catch (err) {
      console.error("save settings failed:", err);
      setSaveError("Something went wrong saving your settings — try again in a moment.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccount();
      const supabase = createClient();
      await supabase.auth.signOut().catch(() => {});
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("delete account failed:", err);
      setDeleteError("Something went wrong deleting your account — try again in a moment.");
      setDeleting(false);
    }
  }

  return (
    <AppShell user={user} maxWidthClassName="max-w-[720px]" contentClassName="flex flex-1 flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-1.5 text-center"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted sm:text-[15px]">Manage your profile, currency, and account.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card>
          <CardTitle>Profile</CardTitle>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label htmlFor="settings-name" className="mb-1.5 block text-[13px] font-medium text-muted">
                Name
              </label>
              <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label htmlFor="settings-email" className="mb-1.5 block text-[13px] font-medium text-muted">
                Email
              </label>
              <Input id="settings-email" value={settings.email} disabled className="opacity-60" />
            </div>

            <div>
              <label htmlFor="settings-income" className="mb-1.5 block text-[13px] font-medium text-muted">
                Monthly income
              </label>
              <Input
                id="settings-income"
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card>
          <CardTitle>Preferences</CardTitle>

          <div className="mt-5 flex flex-col gap-5">
            <div>
              <p className="mb-2.5 text-[13px] font-medium text-muted">Currency</p>
              <div className="flex flex-wrap gap-2.5">
                {CURRENCY_OPTIONS.map((opt) => (
                  <SelectableChip key={opt.code} selected={currency === opt.code} onClick={() => setCurrency(opt.code)}>
                    {opt.label}
                  </SelectableChip>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2.5 text-[13px] font-medium text-muted">Risk tolerance</p>
              <div className="flex flex-wrap gap-2.5">
                {RISK_OPTIONS.map((opt) => (
                  <SelectableChip
                    key={opt.value}
                    selected={riskTolerance === opt.value}
                    onClick={() => setRiskTolerance(opt.value)}
                  >
                    {opt.label}
                  </SelectableChip>
                ))}
              </div>
              <p className="mt-2 text-[13px] text-muted-dim">
                {RISK_OPTIONS.find((o) => o.value === riskTolerance)?.hint}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-4"
      >
        <Button type="button" onClick={handleSave} disabled={!isDirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        <AnimatePresence mode="wait">
          {saveError ? (
            <motion.span
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13px] text-negative"
              role="alert"
            >
              {saveError}
            </motion.span>
          ) : savedAt && !isDirty ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-[13px] text-positive"
            >
              Saved
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Plan</CardTitle>
            <p className="mt-1.5 text-[14px] text-muted">You&apos;re on the Free plan.</p>
            <AnimatePresence>
              {showUpgradeNote && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="mt-2 text-[13px] text-muted-dim"
                >
                  Paid plans aren&apos;t open yet — we&apos;ll let you know when they are.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <Button type="button" variant="outline" onClick={() => setShowUpgradeNote(true)}>
            Upgrade
          </Button>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border-negative/20">
          <CardTitle>Danger zone</CardTitle>
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-[14px] text-muted">
              Permanently delete your account and all associated data. This can&apos;t be undone.
            </p>
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-negative px-5 text-sm font-medium text-white transition-all duration-200 hover:brightness-110"
            >
              Delete account
            </button>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="flex justify-center pb-4"
      >
        <Button type="button" variant="ghost" onClick={logout}>
          Log out
        </Button>
      </motion.div>

      <DeleteAccountDialog
        open={deleteOpen}
        email={settings.email}
        onCancel={() => {
          setDeleteOpen(false);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError}
      />
    </AppShell>
  );
}
