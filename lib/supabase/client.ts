import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client, for use inside "use client" components
 * (login/signup forms, the sidebar's logout button). Reads/writes the
 * session via cookies so it stays in sync with the server-side clients
 * below.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
