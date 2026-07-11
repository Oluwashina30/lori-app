import type { User as SupabaseUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

/**
 * Upserts the Prisma User row for a given Supabase Auth user, reusing the
 * same UUID as the primary key so every existing service keyed off
 * `userId` (goalService, dashboardService, etc.) keeps working unchanged.
 * Called once after a session is first established — password login
 * (app/api/auth/sync/route.ts) and the OAuth/email-confirmation callback
 * (app/auth/callback/route.ts) — not on every request.
 */
export async function ensureUserRecord(user: SupabaseUser) {
  const name =
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split("@")[0] : "New User");

  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      name,
      email: user.email!,
      currency: "NGN",
      riskTolerance: "moderate",
    },
  });
}
