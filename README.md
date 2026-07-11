# Flexi — AI Savings Dashboard

A pixel-faithful recreation of the Flexi finance dashboard design, built with
Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Framer Motion, Recharts,
and lucide-react.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build && npm run start   # production build
npm run lint                     # eslint
```

## Architecture

```
app/
  layout.tsx          Root layout — self-hosted Geist font, global styles
  page.tsx             Server component: fetches dashboard data, renders shell
  globals.css          Design tokens (colors, borders) as CSS variables / Tailwind v4 @theme

components/
  layout/
    sidebar.tsx        Desktop rail (Sidebar) + mobile drawer (MobileTopBar)
    top-header.tsx      "Ask AI" button + avatar
  dashboard/
    dashboard-shell.tsx        Composes the full page, owns composer state
    greeting-section.tsx       Time-aware "Good evening, {name}"
    ai-recommendation-banner.tsx
    chat-composer.tsx          Auto-resizing textarea + toolbar + send
    suggestion-chips.tsx
    total-savings-card.tsx
    savings-plan-card.tsx
    cash-flow-card.tsx
    recent-activities-card.tsx
    ai-insight-card.tsx
  ui/
    button.tsx          shadcn-style button (cva variants incl. gradient border)
    card.tsx
    avatar.tsx
    animated-number.tsx         Count-up animation (Framer Motion)
    progress-bar.tsx            Smooth gradient bar (Monthly savings goal)
    segmented-progress-bar.tsx  "Barcode" tick bar (Savings Plan rows)
    circular-progress.tsx       Recharts RadialBarChart donut (Cash Flow)

lib/
  types.ts             All domain interfaces (DashboardData et al.)
  mock-data.ts          Mock data + fetchDashboardData() — swap this for a
                        real API/Supabase call; no UI code needs to change.
  utils.ts              cn(), currency formatting, greeting, shared gradient math
```

## Connecting a real backend

`lib/mock-data.ts` exports a single async function:

```ts
export async function fetchDashboardData(): Promise<DashboardData> { ... }
```

`app/page.tsx` awaits this once, server-side. To go live, replace the body
with a real fetch (Supabase query, REST call, etc.) — every component already
consumes the typed `DashboardData` shape, so no component changes are
required. Chat submission (`ChatComposer`'s `onSubmit`) and the "Apply
Recommendations" button are wired to stub handlers in `dashboard-shell.tsx`,
ready to be pointed at an OpenAI/agent endpoint.

## Design tokens

Colors were sampled directly from the source design and the provided SVG
export assets:

- Background `#09090b`, card surface `#111114`, border `rgba(255,255,255,0.08)`
- Brand gradient `#FD8A48 → #EA0707 → #F67606` (sidebar active state, send
  button, AI insight accents)
- Positive `#4ADE80`, negative `#FB7185`
- Full-spectrum "heat" gradient (violet → pink → orange → amber → green) drives
  every progress visual and is defined once in `lib/utils.ts`
  (`HEAT_GRADIENT_STOPS`) so the smooth bar, segmented bar, and any future
  chart stay perfectly consistent.

## Responsiveness

- `lg` (desktop): full 3-column card grid, vertical sidebar
- `md` (tablet): 2-column grid (Savings Plan / Cash Flow+Activities), AI
  Insight spans full width; vertical sidebar
- `< md` (mobile): single column stack; sidebar becomes a top bar with a
  slide-in drawer
