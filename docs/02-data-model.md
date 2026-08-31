# Data model

Defined in [`prisma/schema.prisma`](../prisma/schema.prisma). SQLite has no native
enums, so `role`, `status`, and `alert` are stored as strings and validated in the
app layer (`src/lib/constants.ts`).

## Entities

```
User ──1:N──▶ WatchZone ──1:N──▶ AlertLog ◀──N:1── SeismicEvent
  │                                  ▲
  ├──1:N──▶ Bookmark                 │
  └──1:N──────────────────────────── (AlertLog.userId)
```

### User
The account. `role` ∈ `USER | ADMIN`, `status` ∈ `ACTIVE | SUSPENDED`. Stores a
bcrypt `passwordHash` and `lastLoginAt`. Deleting a user cascades to their zones,
bookmarks, and alerts.

### WatchZone
A user-owned circular region: `centerLat/Lng`, `radiusKm`, a `minMagnitude` alert
threshold, and a display `color`. Rendered as a circle on the map.

### Bookmark
A **snapshot** of a saved event (`eventId`, magnitude, place, coordinates, depth,
`occurredAt`) plus an optional `note`. Snapshotting means a bookmark survives even
after the event drops out of the rolling USGS feed. Unique per `(userId, eventId)`.

### SeismicEvent
A cache of ingested USGS events, keyed by the natural USGS `id`. Powers admin
analytics and server-side alert matching. Indexed by `occurredAt` and `magnitude`.

### AlertLog
Records that a `SeismicEvent` matched a `WatchZone` (event magnitude ≥ the zone's
threshold **and** within its radius). Carries a `readAt` for unread counts. Unique
per `(watchZoneId, eventId)` so re-syncing never duplicates alerts.

## Why a snapshot for bookmarks but a cache for events?

- **Bookmarks** must be durable and personal — they keep their own copy so they
  never break when the feed rolls over.
- **SeismicEvents** are shared infrastructure — one row per real event, referenced
  by many alerts, refreshed by sync.

## Seeding

`prisma/seed.ts` is idempotent (wipe → recreate). It:

1. ingests real USGS events (`4.5_month` + `2.5_week`, ~800+ events; synthetic
   fallback if offline),
2. creates an admin, a rich demo member, and ~40 members (bcrypt-hashed),
3. distributes watch zones over seismically active regions,
4. bookmarks notable events, and
5. **derives** alert logs by matching events to zones with a haversine check.

Run with `npm run db:seed` (or automatically via `npm run db:migrate` /
`npm run db:reset`).
