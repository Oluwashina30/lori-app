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

  // Google/Supabase report OAuth failures (denied consent, provider errors)
  // via these query params instead of a `code` — surface them instead of
  // silently bouncing to /login with no explanation.
  const providerError = searchParams.get("error_description") || searchParams.get("error");
  if (providerError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(providerError)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      await ensureUserRecord(data.user);
      return NextResponse.redirect(`${origin}/`);
    }

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("No authorization code received")}`);
}
