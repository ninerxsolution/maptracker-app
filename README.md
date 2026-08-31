# 🌐 MapTracker — Live Global Seismic Monitor

> Track earthquakes worldwide in real time. Watch the regions you care about, bookmark events, and get alerted — powered by live data from the **U.S. Geological Survey**.

MapTracker turns the USGS Earthquake Hazards Program's real-time GeoJSON feed into an interactive world map, wrapped in a full product: a public explorer, a personal dashboard for signed-in users, and an admin backoffice.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma + SQLite · Leaflet · Recharts · hand-rolled JWT auth

---

## ✨ Highlights

- **Live data, no API key** — reads the USGS GeoJSON feeds directly (updated every minute), proxied and cached server-side.
- **Three distinct experiences** — public visitor, authenticated member, and admin — each with a tailored layout.
- **Interactive map** — earthquakes plotted by magnitude, click-to-inspect, fly-to, draw-your-own watch zones.
- **Real product surface** — auth with roles, CRUD, alerts derived from geospatial matching, analytics, moderation, and a manual data-sync pipeline.
- **Considered UX** — Suspense skeletons, loading/empty/error states, optimistic updates, toasts, transitions, `lucide` icons, and Google fonts throughout.

---

## 🔐 Demo accounts

The seed creates two known accounts (plus ~40 members) — one click fills them on the sign-in page:

| Role   | Email                   | Password      |
| ------ | ----------------------- | ------------- |
| Admin  | `admin@maptracker.app`  | `password123` |
| Member | `demo@maptracker.app`   | `password123` |

---

## 🗺️ The three surfaces

**Public** (`/`, `/explore`) — a marketing landing plus a full-screen live map: filter by time window and magnitude, browse a synced event list, and inspect any quake. No login required.

**Member** (`/app/*`) — a personal dashboard: create circular **watch zones** on the map, get a personalized feed of in-zone activity, **bookmark** events with notes, and review **alerts** when a quake matches a zone above its threshold.

**Admin** (`/admin/*`) — a backoffice: platform analytics (signups, events by magnitude), **user management** (roles, suspend, delete), **content moderation**, and a **system** panel with USGS feed health and a one-click sync.

---

## 🚀 Quickstart

```bash
# 1. Install
npm install

# 2. Configure env (a working .env is included for local dev; see .env.example)
cp .env.example .env   # then set AUTH_SECRET

# 3. Create the database + seed with real USGS data
npm run db:migrate     # applies migrations
npm run db:seed        # ingests live USGS events + demo users/zones/bookmarks

# 4. Run
npm run dev            # http://localhost:3000
```

> The seed fetches live USGS data; if you're offline it falls back to a synthetic dataset so the app still demos.

### Scripts

| Script              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Start the dev server (Turbopack)           |
| `npm run build`     | Production build                           |
| `npm run db:migrate`| Apply Prisma migrations                    |
| `npm run db:seed`   | Seed the database                          |
| `npm run db:reset`  | Drop, re-migrate, and re-seed              |
| `npm run db:studio` | Open Prisma Studio                         |

---

## 📁 Project structure

```
src/
  app/
    (auth)/           login, register, auth actions
    app/              authenticated member area (dashboard, zones, bookmarks, alerts)
    admin/            admin backoffice (overview, users, content, system)
    api/quakes/       USGS proxy route
    explore/          public live map
    page.tsx          landing page
  components/
    ui/               design-system primitives (Button, Card, Input, …)
    map/              Leaflet map + dynamic loader
    quakes/           quake list item, detail, badges, bookmark button
    app/ · admin/     shells, nav, charts
    site/ · brand/    public header/footer, logo
  lib/
    auth/             JWT, sessions, password, guards
    db.ts usgs.ts geo.ts zones.ts magnitude.ts constants.ts validators.ts format.ts
prisma/
  schema.prisma       data model
  seed.ts             seed script
```

---

## 📚 Documentation

Deeper docs live in [`/docs`](./docs):

- [Overview](./docs/00-overview.md) — the concept and problem
- [Architecture](./docs/01-architecture.md) — stack, rendering strategy, data flow
- [Data model](./docs/02-data-model.md) — schema and relationships
- [USGS integration](./docs/03-usgs-integration.md) — feeds, proxy, sync
- [Authentication](./docs/04-authentication.md) — sessions and role-based access
- [Features](./docs/05-features.md) — a guided tour of every screen
- [Deployment](./docs/06-deployment.md) — local vs. Vercel (Turso/Postgres)
- [Decisions](./docs/07-decisions.md) — the notable engineering trade-offs

---

## 📡 Data & attribution

Seismic data courtesy of the [**USGS Earthquake Hazards Program**](https://earthquake.usgs.gov/) (public domain). Basemap tiles © Esri and © OpenStreetMap contributors. MapTracker is an independent project and is not affiliated with or endorsed by the USGS.
