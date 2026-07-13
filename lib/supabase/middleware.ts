import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/auth/callback"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/**
 * Refreshes the Supabase session cookie on every request and enforces
 * route protection. Must be called from middleware.ts at the project
 * root — this is the one place allowed to write cookies on a response
 * that's actually sent back to the browser (Server Components can't).
 *
 * Also stamps a validated `x-supabase-user-id` request header so pages and
 * API routes (lib/server/auth.ts) don't have to re-call supabase.auth.getUser()
 * — a second network round trip for work this function already did.
 */
export async function updateSession(request: NextRequest) {
  // Strip any client-supplied value first so this header can never be
  // spoofed — from here on it only ever reflects what this function itself
  // validates below.
  request.headers.delete("x-supabase-user-id");

  const { pathname } = request.nextUrl;
  const isPublic = isPublicPath(pathname);
  // "/" renders a public marketing landing page for anonymous visitors
  // (app/page.tsx branches on getUserId()) but must NOT skip the
  // onboarding-completion gate below for authenticated users — so this is
  // deliberately kept separate from isPublic rather than added to
  // PUBLIC_PATHS, which would also exempt it from that gate.
  const isAnonymousRoot = pathname === "/";

  // Fast path: no Supabase session cookie at all means nothing to validate
  // or refresh — skip the network round trip entirely (the common case for
  // anonymous visitors landing on /login or /signup).
  const hasAuthCookie = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!hasAuthCookie) {
    if (!isPublic && !isAnonymousRoot) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  // Accumulate any cookies Supabase needs refreshed rather than building
  // intermediate NextResponse objects — those get discarded below once we
  // know the final user/header state, so building them early was wasted
  // work (and, in the header-setting case, would have silently dropped
  // these cookies entirely).
  let pendingCookies: { name: string; value: string; options: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          pendingCookies = cookiesToSet;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic && !isAnonymousRoot) {
    const url = request.nextUrl.clone();
    const redirectResponse = NextResponse.redirect(new URL("/login", url));
    pendingCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const redirectResponse = NextResponse.redirect(new URL("/", request.nextUrl));
    pendingCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
    return redirectResponse;
  }

  if (user) {
    request.headers.set("x-supabase-user-id", user.id);

    // Onboarding-complete gate: read off Supabase user_metadata rather than
    // querying Postgres here — this function only ever talks to Supabase
    // Auth, never Prisma, which keeps it safe to run in any middleware
    // runtime. /api/onboarding/complete stamps this flag (and the Postgres
    // column that's its source of truth) once onboarding finishes. API
    // routes are exempt — they're called *from* the onboarding page itself
    // and have their own auth checks; redirecting them would return HTML
    // where the client expects JSON.
    const onboardingCompleted = user.user_metadata?.onboarding_completed === true;
    const isApiRoute = pathname.startsWith("/api/");
    const isOnboardingRoute = pathname === "/onboarding" || pathname.startsWith("/onboarding/");

    if (!onboardingCompleted && !isApiRoute && !isOnboardingRoute && !isPublic) {
      const redirectResponse = NextResponse.redirect(new URL("/onboarding", request.nextUrl));
      pendingCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
      return redirectResponse;
    }

    if (onboardingCompleted && isOnboardingRoute) {
      const redirectResponse = NextResponse.redirect(new URL("/", request.nextUrl));
      pendingCookies.forEach(({ name, value, options }) => redirectResponse.cookies.set(name, value, options));
      return redirectResponse;
    }
  }

  const response = NextResponse.next({ request });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
