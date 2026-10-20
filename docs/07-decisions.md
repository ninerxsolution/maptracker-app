# Engineering decisions

Short ADR-style notes on the choices worth explaining.

## Hand-rolled auth over Auth.js

**Decision:** JWT sessions with `jose` + `bcryptjs`, not Auth.js/NextAuth.
**Why:** the credentials + role + suspended-account flow is small and well-trodden,
and Auth.js v5 is still beta on Next 16. Hand-rolling gave full control over the
cookie, the middleware gate, and the DB re-check, with no beta surprises.
**Trade-off:** we own more code (sign/verify, cookie, guards) — but it's ~150
readable lines and easy to reason about.

## Prisma 6, not 7

**Decision:** pin Prisma 6.
**Why:** Prisma 7 (which installs by default now) moves configuration into a
`prisma7.config.ts` file and ships a new ESM `prisma-client` generator with a
custom output path. That's more moving parts to integrate with Next's bundler.
Prisma 6's classic `prisma-client-js` generator + `url = env(...)` is the
well-documented path.
**Trade-off:** not on the newest major — trivially upgradable later.

## Postgres (Neon) for deployment

**Decision:** moved from SQLite to PostgreSQL — Docker locally, Neon on Vercel.
**Why:** a SQLite file can't persist on Vercel (ephemeral serverless filesystem,
no shared disk). Neon has a permanent free tier, plugs into Vercel with one click
(injecting pooled + direct URLs), and Prisma Migrate works against it directly.
Turso (SQLite-compatible) was considered, but with Prisma 6 its migrations need a
workaround that is partly early-access. Because all queries go through Prisma and
none were SQLite-specific, the switch only touched the datasource, the migrations,
and local setup.

## (History) SQLite for the first demo

**Decision:** SQLite locally; document Turso/Postgres for Vercel.
**Why:** zero-config, fast, and the whole app (including a rich seed from live
data) runs from a single `npm run db:seed`. Prisma keeps the migration to a hosted
DB small. **Caveat:** SQLite has no native enums, so `role`/`status` are strings
validated in `lib/constants.ts`.

## Esri Dark Gray basemap, not CARTO

**Decision:** Esri World Dark Gray tiles.
**Why:** CARTO's dark basemap — the usual keyless dark choice — now stamps
"API KEY REQUIRED" watermarks on keyless use. Esri's dark-gray base is keyless,
genuinely dark, and matches the UI. OpenStreetMap standard tiles are the keyless
fallback but are light.

## Client-side magnitude filtering

**Decision:** fetch the full time-window once, filter magnitude in memory.
**Why:** the feed for a window contains all magnitudes, so changing the magnitude
filter shouldn't hit the network. Only a **window** change refetches (from the
cached proxy). Result: instant filtering, minimal requests.

## Bookmarks snapshot; events are a shared cache

**Decision:** `Bookmark` stores its own copy of the event; `SeismicEvent` is a
shared, sync-refreshed cache.
**Why:** a user's saved event must survive the rolling feed, while events used for
analytics/alerts should be single rows referenced by many alerts. See
[data model](./02-data-model.md).

## Hydration-safe relative time

**Decision:** a `RelativeTime` client component that renders after mount.
**Why:** "3 minutes ago" computed during SSR differs from the value at hydration
(time moved), causing React hydration mismatches. Rendering relative time only
after mount makes server and first client render agree.

## Hardened via an adversarial review

Before the final polish, the codebase was run through a multi-agent review
(correctness, security, accessibility, performance), and every confirmed finding
was fixed or consciously scoped. Notable fixes: a redirect loop for
suspended-mid-session accounts (now cleared via a `/logout` handler), a login
`next` open-redirect, production `AUTH_SECRET` strength enforcement, a full
accessibility pass (reduced-motion, focus-safe mobile drawers, ARIA roles/labels,
AA contrast), and DB-side aggregation + new indexes for the admin analytics.

## GitHub-flow delivery

The app was built issue-by-issue: a GitHub milestone with eight issues, each on
its own feature branch and squash-merged via a pull request — so the history reads
as a sequence of reviewable, scoped changes.
