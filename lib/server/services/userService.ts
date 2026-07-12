import { prisma } from "../../prisma";

export function getUserSettings(userId: string) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId } });
}

export function updateUserSettings(
  userId: string,
  data: {
    name?: string;
    currency?: string;
    riskTolerance?: string;
    monthlyIncome?: number | null;
  }
) {
  return prisma.user.update({ where: { id: userId }, data });
}

/**
 * Full account deletion. Prisma-side rows go first (order matters for the
 * foreign keys back to User), then a best-effort removal of the Supabase
 * Auth user itself so the account can't simply be recreated by logging
 * back in — ensureUserRecord() is an upsert, so leaving the auth user
 * behind would silently resurrect a fresh, empty Prisma row on next login.
 *
 * There's no Supabase service-role admin client in this project (no
 * SUPABASE_SERVICE_ROLE_KEY), so this can't call the supported
 * `auth.admin.deleteUser` API — it relies instead on DATABASE_URL's
 * Postgres role having access to the `auth` schema, which is true for
 * Supabase's default connection string. If that raw delete fails, it's
 * logged but not thrown: every row the app itself reads/writes is already
 * gone by that point, which is what actually matters to the user.
 */
export async function deleteUserAccount(userId: string) {
  await prisma.$transaction([
    prisma.chatMessage.deleteMany({ where: { userId } }),
    prisma.insight.deleteMany({ where: { userId } }),
    prisma.transaction.deleteMany({ where: { userId } }),
    prisma.goal.deleteMany({ where: { userId } }),
    prisma.onboardingSession.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  try {
    await prisma.$executeRaw`DELETE FROM auth.users WHERE id = ${userId}::uuid`;
  } catch (err) {
    console.error("deleteUserAccount: failed to remove Supabase auth user (Prisma data was deleted successfully):", err);
  }
}
