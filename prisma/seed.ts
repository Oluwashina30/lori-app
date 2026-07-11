// Standalone script — uses its own PrismaClient rather than the app's
// singleton (lib/prisma.ts) since this runs once via `npx prisma db seed`,
// outside the Next.js request lifecycle where connection reuse matters.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "test@example.com",
      currency: "NGN",
      monthlyIncome: 500000,
      riskTolerance: "moderate",
    },
  });
  // Note: this seeds a Prisma-only user, disconnected from Supabase Auth.
  // To actually log in, sign up via /signup — that creates a Supabase Auth
  // user and a matching Prisma User row (same id) via ensureUserRecord().
  console.log("Seeded user:", user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
