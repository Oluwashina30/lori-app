import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server-side Supabase client for Server Components and Route Handlers.
 * Reads the session from the request's cookies. Writes are best-effort:
 * Server Components can't set cookies, so those calls are wrapped in a
 * try/catch (middleware.ts is what actually refreshes the session cookie
 * on every request, so this is safe to ignore there).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component — middleware.ts handles the
            // actual session refresh, so this can be safely ignored.
          }
        },
      },
    }
  );
}
