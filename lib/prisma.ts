import { PrismaClient } from "@prisma/client";

// Standard Next.js/serverless Prisma singleton pattern. Without this, every
// route invocation (or hot-reload in dev) can spin up a new PrismaClient,
// which exhausts Postgres connections fast — this is exactly why the
// Supabase DATABASE_URL below should be the *pooled* (pgbouncer) one.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
