import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Reads the authenticated user id. middleware.ts already validates the
 * session with Supabase's Auth server once per request and stamps the
 * result onto a request header — reading that here avoids every page and
 * API route re-doing that same network round trip. Falls back to a direct
 * Supabase call only if the header is somehow missing (defensive; the
 * middleware matcher covers every route that calls this).
 */
export async function getUserId(): Promise<string | null> {
  const headerUserId = (await headers()).get("x-supabase-user-id");
  if (headerUserId) return headerUserId;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
