# Architecture

## Stack

| Layer      | Choice | Why |
| ---------- | ------ | --- |
| Framework  | **Next.js 16** (App Router) | Server Components + Server Actions keep data on the server and the client bundle lean |
| Language   | **TypeScript** (strict) | End-to-end types from DB to UI |
| UI         | **Tailwind CSS v4**, `lucide-react`, `next/font` (Inter / Space Grotesk / JetBrains Mono) | Fast, consistent, token-driven design system |
| Motion     | **motion** (Framer) + CSS keyframes | Reveal-on-scroll, transitions, micro-interactions |
| Data viz   | **Recharts** | Admin analytics |
| Map        | **Leaflet** + `react-leaflet` v5 | Mature, no key required |
| ORM/DB     | **Prisma 6** + **SQLite** | Zero-config local dev; swappable for Postgres/Turso |
| Auth       | Hand-rolled: **jose** (JWT) + **bcryptjs** | Full control, no beta dependencies |
| Validation | **zod** | Shared schemas for actions and forms |

## Rendering strategy

The app leans on the App Router's server/client split:

- **Server Components** do all data fetching (Prisma queries, USGS fetches) and
  never ship that code or data-access to the client.
- **Client Components** (`"use client"`) handle interactivity: the map, filters,
  forms, optimistic mutations, and toasts.
- **Server Actions** are the only write path. Every mutation re-checks auth and
  ownership on the server, then `revalidatePath`s the affected routes.
- **`next/dynamic` with `ssr: false`** wraps Leaflet, which touches `window` and
  must not render on the server.

### Data flow (example: the public map)

```
USGS feed ──(server fetch, revalidate 60s)──▶ /api/quakes (route handler)
                                                   │
                          initial SSR fetch        │ client fetch on filter change
                                   ▼               ▼
                         explore/page.tsx ──▶ ExploreClient ──▶ Leaflet map
```

The server component fetches an initial dataset for fast first paint; the client
re-fetches from the cached proxy when the time window changes, and filters by
magnitude in-memory for instant response.

## Directory layout

- `src/app` — routes, grouped by surface: `(auth)`, `app` (member), `admin`,
  `explore`, plus `api/quakes`.
- `src/components` — `ui` primitives, plus feature folders (`map`, `quakes`,
  `app`, `admin`, `site`, `brand`).
- `src/lib` — framework-free logic: `db`, `usgs`, `geo`, `zones`, `magnitude`,
  `auth/*`, `validators`, `constants`, `format`.
- `prisma` — schema, migrations, and the seed.

## Auth gating (defense in depth)

1. **`middleware.ts`** verifies the JWT at the edge and redirects unauthenticated
   or under-privileged requests before a page renders.
2. **Layouts** (`app/layout.tsx`, `admin/layout.tsx`) call `requireUser` /
   `requireAdmin`, which re-check against the database (so a suspended account is
   rejected even with a valid token).
3. **Server actions** re-assert the guard and verify per-row ownership.

See [Authentication](./04-authentication.md).

## The design system

`globals.css` defines a dark, token-based theme via Tailwind v4 `@theme`
(surfaces, text, a brand cyan, a six-stop magnitude ramp, fonts, radii, and
custom animations). Components compose these tokens through a `cn()` helper
(`clsx` + `tailwind-merge`). The magnitude ramp is the one piece of "data
colour" and is shared by the map, list, badges, and legend via
`lib/magnitude.ts`.
