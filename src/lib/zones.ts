import { distanceKm } from "./geo";
import type { Quake } from "./usgs";

export type ZoneLike = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  minMagnitude: number;
  color: string;
};

export type QuakeInZone = Quake & { zoneIds: string[] };

/** Quakes that fall inside at least one zone (respecting each zone's min magnitude). */
export function quakesInZones(
  quakes: Quake[],
  zones: ZoneLike[],
): QuakeInZone[] {
  if (zones.length === 0) return [];
  const out: QuakeInZone[] = [];
  for (const q of quakes) {
    const zoneIds: string[] = [];
    for (const z of zones) {
      if (
        (q.mag ?? 0) >= z.minMagnitude &&
        distanceKm(z.centerLat, z.centerLng, q.lat, q.lng) <= z.radiusKm
      ) {
        zoneIds.push(z.id);
      }
    }
    if (zoneIds.length) out.push({ ...q, zoneIds });
  }
  return out;
}
