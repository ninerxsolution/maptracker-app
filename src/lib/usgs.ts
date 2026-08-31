import { USGS_FEEDS, type TimeWindow } from "./constants";

/** Normalized earthquake — coordinates already swapped to [lat, lng]. */
export type Quake = {
  id: string;
  mag: number | null;
  place: string | null;
  title: string | null;
  time: number; // epoch ms
  updated: number | null; // epoch ms
  lat: number;
  lng: number;
  depth: number | null; // km
  url: string | null;
  felt: number | null;
  tsunami: number;
  alert: string | null;
  sig: number | null;
  magType: string | null;
};

export type QuakeResponse = {
  quakes: Quake[];
  generated: number;
  count: number;
  window: TimeWindow;
  minMag: number;
};

type RawFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    title: string | null;
    time: number;
    updated: number | null;
    url: string | null;
    felt: number | null;
    tsunami: number | null;
    alert: string | null;
    sig: number | null;
    magType: string | null;
  };
  geometry: { coordinates: [number, number, number] } | null;
};

function mapFeature(f: RawFeature): Quake | null {
  const c = f.geometry?.coordinates;
  if (!c || typeof c[0] !== "number" || typeof c[1] !== "number") return null;
  const p = f.properties;
  return {
    id: f.id,
    mag: p.mag,
    place: p.place,
    title: p.title,
    time: p.time,
    updated: p.updated,
    lat: c[1],
    lng: c[0],
    depth: typeof c[2] === "number" ? c[2] : null,
    url: p.url,
    felt: p.felt,
    tsunami: p.tsunami ?? 0,
    alert: p.alert,
    sig: p.sig,
    magType: p.magType,
  };
}

/**
 * Fetch a USGS summary feed (server-side, cached 60s to match USGS's cadence),
 * normalize it, and filter by minimum magnitude.
 */
export async function fetchQuakes(
  window: TimeWindow,
  minMag = 0,
): Promise<QuakeResponse> {
  const res = await fetch(USGS_FEEDS[window], {
    next: { revalidate: 60 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`USGS feed responded ${res.status}`);

  const json = (await res.json()) as {
    features?: RawFeature[];
    metadata?: { generated?: number };
  };

  const quakes = (json.features ?? [])
    .map(mapFeature)
    .filter((q): q is Quake => q !== null && (q.mag ?? -Infinity) >= minMag)
    .sort((a, b) => b.time - a.time);

  return {
    quakes,
    generated: json.metadata?.generated ?? Date.now(),
    count: quakes.length,
    window,
    minMag,
  };
}

/** Summary stats for a set of quakes (for stat tiles). */
export function summarize(quakes: Quake[]) {
  let maxMag = 0;
  let felt = 0;
  let significant = 0;
  let tsunami = 0;
  for (const q of quakes) {
    if ((q.mag ?? 0) > maxMag) maxMag = q.mag ?? 0;
    if (q.felt) felt += q.felt;
    if ((q.sig ?? 0) >= 600) significant += 1;
    if (q.tsunami) tsunami += 1;
  }
  return { total: quakes.length, maxMag, felt, significant, tsunami };
}
