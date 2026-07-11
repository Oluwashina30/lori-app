import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureUserRecord } from "@/lib/server/ensureUser";

/**
 * Landing point for Supabase email-confirmation links and the Google
 * OAuth redirect. Exchanges the one-time code for a session, makes sure a
 * matching Prisma User row exists, then sends the user into the app.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureUserRecord(data.user);
      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
