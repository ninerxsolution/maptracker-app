import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { fetchQuakes, type Quake } from "@/lib/usgs";
import { ZonesManager } from "./zones-manager";
import type { ZoneRow } from "../actions";

export const metadata = { title: "โซนเฝ้าระวัง" };

export default async function ZonesPage() {
  const user = await requireUser();

  const zones = await db.watchZone.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  let quakes: Quake[] = [];
  try {
    quakes = (await fetchQuakes("day", 2.5)).quakes;
  } catch {
    quakes = [];
  }

  const zoneRows: ZoneRow[] = zones.map((z) => ({
    id: z.id,
    name: z.name,
    centerLat: z.centerLat,
    centerLng: z.centerLng,
    radiusKm: z.radiusKm,
    minMagnitude: z.minMagnitude,
    color: z.color,
  }));

  return (
    <div className="h-full">
      <ZonesManager initialZones={zoneRows} quakes={quakes} />
    </div>
  );
}
