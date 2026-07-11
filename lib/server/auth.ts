import { createClient } from "@/lib/supabase/server";

/**
 * Reads the authenticated user id from the Supabase session cookie
 * (refreshed on every request by middleware.ts). Every API route calls
 * this one function, so it's the only place that needed to change when
 * real auth replaced the old x-user-id placeholder.
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}
