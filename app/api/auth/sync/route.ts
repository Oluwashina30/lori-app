import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserRecord } from "@/lib/server/ensureUser";

/**
 * Called right after a successful password sign-in (components/auth/login-form.tsx),
 * which — unlike OAuth/email-confirmation — never passes through
 * app/auth/callback/route.ts. Makes sure the Prisma User row exists for
 * the now-authenticated Supabase user.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await ensureUserRecord(user);
  return NextResponse.json({ ok: true });
}
