# Features — a guided tour

## Public

### Landing (`/`)
Marketing hero with a live-feed visual, a feature grid, a "straight from the
source" section with the magnitude legend, and a session-aware header (shows
**Dashboard** + avatar when signed in).

### Explore (`/explore`)
The public centrepiece — a full-screen live map:

- **Filters** — time window (hour/day/week/month) and minimum magnitude.
- **Stat tiles** — max magnitude, significant count, total felt reports.
- **Event list ↔ map ↔ detail** — selecting anywhere highlights the marker, flies
  the map to it, and opens a detail panel (depth, coordinates, PAGER alert,
  tsunami flag, felt reports, USGS link).
- **Live** — auto-refreshes every 60s; a manual refresh button too.
- Signed-in users get a **Save/Saved** bookmark toggle in the detail panel.

### Countries (`/countries`)
The earthquake situation per country (and per ocean region for offshore events):

- USGS has no country field, so `src/lib/countries.ts` normalises the free-text
  `place` — US states roll up into the United States (with a per-state breakdown),
  island groups map to their sovereign country, aliases like `MX` / `Burma (Myanmar)`
  are merged, and mid-ocean ridges/seas form their own groups. Names are shown in
  Thai via `Intl.DisplayNames`.
- Per country: event count, max magnitude, significant events, felt reports,
  tsunami flags, latest event, and a **situation level** — รุนแรง (M6+ or PAGER
  orange/red), เฝ้าระวัง (M4.5+, PAGER yellow, or a tsunami flag), else ปกติ.
- Time-window and magnitude filters live in the URL; search (Thai or English, incl.
  sub-regions), sort, and expandable rows with the latest events.

## Member (`/app/*`)

### Dashboard (`/app`)
Stat tiles (zones, bookmarks, unread alerts, 7-day in-zone activity), a mini-map
of your zones with the quakes inside them, a **personalized feed** of recent
in-zone activity, and recent alerts/bookmarks.

### Watch zones (`/app/zones`)
Interactive CRUD:

- Click the map (or pick a region preset) to place a center; a draft circle
  previews the zone.
- Tune **radius**, **alert threshold**, and **colour**.
- Create · edit · delete, each with immediate feedback. Existing zones render as
  circles for context.

### Bookmarks (`/app/bookmarks`)
A grid of saved events with inline **note** editing, a link back to USGS, and
delete.

### Alerts (`/app/alerts`)
Events that matched your zones, with the matching zone shown, optimistic **read**
toggles, and **mark all read**. The sidebar shows an unread badge.

## Admin (`/admin/*`)

### Overview (`/admin`)
Platform stat tiles and charts: **new signups (30 days)** area chart, **events by
magnitude** bar chart, newest members, and a composition breakdown.

### Users (`/admin/users`)
A searchable table: promote/demote role, suspend/reactivate, and delete — with
self-protection (you can't lock yourself out). Each action is optimistic and
toasted.

### Content (`/admin/content`)
Moderate every watch zone and bookmark across accounts (owner shown), with delete.

### System (`/admin/system`)
USGS pipeline status, a live **feed-health** check, **Sync now** (ingests new
events and recomputes alerts), and a recent cross-user alert feed.

## UX details throughout

Suspense `loading.tsx` skeletons on every async route, component-level skeletons,
empty and error states, optimistic mutations with `sonner` toasts, scroll-reveal
and page transitions, consistent `lucide` iconography, a Google-font type scale,
a responsive sidebar with a mobile drawer, and accessible focus states.
