# USGS integration

## The feeds

The USGS Earthquake Hazards Program publishes summary GeoJSON feeds at:

```
https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/{level}_{period}.geojson
```

where `period` ∈ `hour | day | week | month` and `level` includes `all`, `2.5`,
`4.5`, `significant`. `fetchQuakes` picks the **smallest feed that still covers
the requested minimum magnitude** (`all` → `1.0` → `2.5` → `4.5`) and then filters
by magnitude itself. This matters: `all_month` is ~7–9 MB, over Next's 2 MB
fetch-cache limit, while `2.5_month` is ~1.3 MB and caches normally. **No API
key is required**, and the feeds send permissive CORS headers, so they're
fetchable from both the server and the browser. They regenerate about once a
minute.

## Normalisation

USGS returns coordinates as `[longitude, latitude, depth]` and times as **epoch
milliseconds**. `src/lib/usgs.ts` normalises each feature into a clean `Quake`:

- swaps coordinates to `[lat, lng]` (what Leaflet expects),
- keeps `time`/`updated` as epoch ms,
- guards the many nullable fields (`mag`, `felt`, `alert`, …),
- and sorts newest-first.

## The proxy

`src/app/api/quakes/route.ts` sits between the client and USGS:

- fetches server-side with `next: { revalidate: 60 }` so repeated requests share a
  cached response (respecting USGS's once-a-minute cadence),
- validates the `window` param and applies `minMag`,
- returns a compact JSON payload with a `Cache-Control` header.

The public map fetches its full window once from this proxy, then filters by
magnitude in-memory — so changing the magnitude filter is instant and only a
window change triggers a network request. The map auto-refreshes every 60s.

## Ingestion & alert matching (admin sync)

The live map is ephemeral; to power analytics and alerts, events are **ingested**
into the `SeismicEvent` table:

- the seed does an initial bulk ingest,
- the admin **System → Sync now** action (`syncNow` in `src/app/admin/actions.ts`)
  fetches the current feeds, inserts events not already stored, then recomputes
  alerts for every watch zone against recent events — creating an `AlertLog`
  wherever an event is within a zone's radius and above its threshold (skipping
  any that already exist).

Distance uses the haversine formula in `src/lib/geo.ts`.

## Basemap tiles

The map uses **Esri World Dark Gray** tiles, which require no key and match the
dark UI. (CARTO's basemaps, a common alternative, now watermark keyless use — see
[Decisions](./07-decisions.md).) Attribution is shown on the map and in the
footer.
