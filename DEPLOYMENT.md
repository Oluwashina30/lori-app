# Deploying Lori: Supabase + Vercel

Everything now lives in one Next.js project — the AI logic runs inside
`app/api/*` route handlers as Vercel serverless functions, no separate
backend to host or CORS to configure.

## 1. Merge these files into your Lori project

Copy this zip's contents on top of your existing project (same relative
paths). New files: `lib/prisma.ts`, `lib/server/**`, `app/api/**`,
`prisma/`. Changed files: `lib/api-client.ts`, `lib/mock-data.ts`,
`lib/mock-chat.ts`, `components/chat/chat-page-client.tsx`,
`components/dashboard/dashboard-shell.tsx`, `package.json`.

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at supabase.com.
2. Go to **Project Settings → Database → Connection string**.
3. You need two URLs:
   - **Transaction pooler** (port 6543) → this is `DATABASE_URL`. Add
     `?pgbouncer=true` to the end if it's not already there. This is what
     your serverless functions use at runtime — pooling matters because
     every function invocation can be a fresh connection, and Postgres has
     a hard connection limit.
   - **Direct connection** (port 5432) → this is `DIRECT_URL`. Only
     Prisma's migration tooling uses this.
4. Copy both into `.env.local` (see `.env.local.example`).

## 3. Run the first migration

```bash
npx prisma migrate dev --name init
```

## 4. Set up Supabase Auth

1. In the Supabase dashboard, go to **Authentication → Providers** and
   confirm Email is enabled (email confirmation on by default).
2. To enable the Google button, also enable the Google provider there and
   add your OAuth client id/secret (from Google Cloud Console).
3. Go to **Project Settings → API** and copy the **Project URL** and
   **anon public** key into `.env.local` as `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see `.env.local.example`).
4. Under **Authentication → URL Configuration**, add
   `http://localhost:3000/auth/callback` (and your production URL's
   equivalent once deployed) to the redirect allow-list.

## 5. Test locally

```bash
npm run dev
```

Open `localhost:3000` — it redirects to `/login`. Sign up at `/signup`,
confirm via the email link, then use the chat box — this hits
`/api/chat`, which calls Claude server-side and writes to your real
Supabase database.

## 6. Deploy to Vercel

```bash
npx vercel
```

Or connect the GitHub repo in the Vercel dashboard. Either way, before the
first deploy (or right after, then redeploy), set these in **Project
Settings → Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Supabase pooled connection | |
| `DIRECT_URL` | Supabase direct connection | |
| `ANTHROPIC_API_KEY` | your key | **Do not** prefix with `NEXT_PUBLIC_` — this must stay server-only |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon public key | safe to expose to the browser |

Also add your production URL's `/auth/callback` (e.g.
`https://your-app.vercel.app/auth/callback`) to Supabase's redirect
allow-list (**Authentication → URL Configuration**) before testing signup
on the deployed site.

`npm install` runs `prisma generate` automatically via the `postinstall`
script already added to `package.json`, so Vercel's build will produce a
working Prisma client without extra config.

## How the AI feature is actually integrated

`app/api/chat/route.ts` is the one place Claude gets called:

1. Browser submits a message → `POST /api/chat` (same origin, no API key
   involved on the client at all)
2. The route handler pulls the user's live context (active goals, recent
   spend) from Supabase via Prisma
3. `lib/server/ai/intentParser.ts` sends that + the message to Claude with
   a forced tool call (`create_goal`, `add_contribution`, `log_expense`,
   `request_insight`, or `chit_chat`)
4. `lib/server/services/actionExecutor.ts` writes the result back to
   Supabase
5. The route returns `{ reply, action, data }` to the browser

`ANTHROPIC_API_KEY` only ever exists in Vercel's server environment — it's
read by `process.env.ANTHROPIC_API_KEY` inside `intentParser.ts`, which
only ever runs inside the route handler (server-side), never in a client
component. That's the whole security model: as long as no file that
imports `@anthropic-ai/sdk` has `"use client"` at the top, the key can't
leak to the browser bundle.

## Auth

Real auth via Supabase Auth (email/password with confirmation, plus
optional Google OAuth). `middleware.ts`/`proxy.ts` refreshes the session
cookie and redirects unauthenticated requests to `/login`;
`lib/server/auth.ts`'s `getUserId()` reads the session server-side for
every API route. See `lib/supabase/*`, `app/(auth)/*`, and
`app/auth/callback/route.ts`.

## What's still a placeholder

- **Auto-save execution**: `runAutoSaveAnalysis` in `insightService.ts`
  still only recommends an amount — nothing calls it on a schedule yet.
  Vercel Cron (a `vercel.json` cron entry hitting a new `/api/cron/auto-save`
  route) is the natural way to run it nightly per user once you're ready.
