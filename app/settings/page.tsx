import { redirect } from "next/navigation";
import { SettingsPageClient } from "@/components/settings/settings-page-client";
import { getUserId } from "@/lib/server/auth";
import { getUserSettings } from "@/lib/server/services/userService";
import type { RiskTolerance, UserSettings } from "@/lib/types";

export default async function SettingsPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const user = await getUserSettings(userId);

  const settings: UserSettings = {
    id: user.id,
    name: user.name,
    email: user.email,
    currency: user.currency,
    riskTolerance: (user.riskTolerance as RiskTolerance) ?? "moderate",
    monthlyIncome: user.monthlyIncome ? Number(user.monthlyIncome) : null,
    createdAt: user.createdAt.toISOString(),
  };

  return (
    <SettingsPageClient
      user={{
        id: user.id,
        name: user.name,
        initials: user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2),
      }}
      initialSettings={settings}
    />
  );
}
