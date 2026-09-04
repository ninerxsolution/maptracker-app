"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/current-user";
import { fetchQuakes, type Quake } from "@/lib/usgs";
import { ROLES, USER_STATUSES } from "@/lib/constants";

export type AdminResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

// ------------------------- User management -------------------------
export async function setUserRole(
  userId: string,
  role: string,
): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (!ROLES.includes(role as (typeof ROLES)[number]))
    return { ok: false, error: "บทบาทไม่ถูกต้อง" };
  if (userId === admin.id && role !== "ADMIN")
    return { ok: false, error: "ไม่สามารถลบบทบาทผู้ดูแลระบบของตัวเองได้" };

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setUserStatus(
  userId: string,
  status: string,
): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (!USER_STATUSES.includes(status as (typeof USER_STATUSES)[number]))
    return { ok: false, error: "สถานะไม่ถูกต้อง" };
  if (userId === admin.id && status === "SUSPENDED")
    return { ok: false, error: "ไม่สามารถระงับบัญชีของตัวเองได้" };

  await db.user.update({ where: { id: userId }, data: { status } });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteUser(userId: string): Promise<AdminResult> {
  const admin = await requireAdmin();
  if (userId === admin.id)
    return { ok: false, error: "ไม่สามารถลบบัญชีของตัวเองได้" };

  await db.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true };
}

// ------------------------- Moderation -------------------------
export async function adminDeleteZone(id: string): Promise<AdminResult> {
  await requireAdmin();
  await db.watchZone.delete({ where: { id } });
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function adminDeleteBookmark(id: string): Promise<AdminResult> {
  await requireAdmin();
  await db.bookmark.delete({ where: { id } });
  revalidatePath("/admin/content");
  return { ok: true };
}

// ------------------------- USGS sync -------------------------
async function chunked<T>(rows: T[], fn: (b: T[]) => Promise<unknown>, size = 200) {
  for (let i = 0; i < rows.length; i += size) await fn(rows.slice(i, i + size));
}

export async function syncNow(): Promise<
  AdminResult<{ newEvents: number; newAlerts: number }>
> {
  await requireAdmin();

  let quakes: Quake[] = [];
  try {
    const [week, day] = await Promise.all([
      fetchQuakes("week", 4.5),
      fetchQuakes("day", 2.5),
    ]);
    const byId = new Map<string, Quake>();
    [...week.quakes, ...day.quakes].forEach((q) => byId.set(q.id, q));
    quakes = [...byId.values()];
  } catch {
    return { ok: false, error: "ไม่สามารถเชื่อมต่อฟีด USGS ได้" };
  }

  // Insert events not already stored.
  const ids = quakes.map((q) => q.id);
  const existing = await db.seismicEvent.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((e) => e.id));
  const newRows = quakes
    .filter((q) => !existingIds.has(q.id))
    .map((q) => ({
      id: q.id,
      magnitude: q.mag,
      place: q.place,
      latitude: q.lat,
      longitude: q.lng,
      depthKm: q.depth,
      occurredAt: new Date(q.time),
      updatedAt: new Date(q.updated ?? q.time),
      magType: q.magType,
      type: "earthquake",
      tsunami: q.tsunami,
      felt: q.felt,
      alert: q.alert,
      significance: q.sig,
      url: q.url,
      source: "usgs",
    }));
  await chunked(newRows, (b) => db.seismicEvent.createMany({ data: b }), 100);

  // Recompute alerts for all zones against recent events (last 14 days).
  const recentEvents = await db.seismicEvent.findMany({
    where: { occurredAt: { gte: new Date(Date.now() - 14 * 86400000) } },
    select: {
      id: true,
      magnitude: true,
      latitude: true,
      longitude: true,
      occurredAt: true,
    },
  });
  const [zones, existingAlerts] = await Promise.all([
    db.watchZone.findMany(),
    // Only the alerts that could collide with the candidate events, not the whole table.
    db.alertLog.findMany({
      where: { eventId: { in: recentEvents.map((e) => e.id) } },
      select: { watchZoneId: true, eventId: true },
    }),
  ]);
  const alertKey = new Set(
    existingAlerts.map((a) => `${a.watchZoneId}:${a.eventId}`),
  );

  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  function within(z: (typeof zones)[number], lat: number, lng: number) {
    const dLat = toRad(lat - z.centerLat);
    const dLng = toRad(lng - z.centerLng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(z.centerLat)) * Math.cos(toRad(lat)) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h))) <= z.radiusKm;
  }

  const newAlerts: {
    userId: string;
    watchZoneId: string;
    eventId: string;
    magnitude: number | null;
  }[] = [];
  for (const z of zones) {
    for (const ev of recentEvents) {
      if ((ev.magnitude ?? 0) < z.minMagnitude) continue;
      if (!within(z, ev.latitude, ev.longitude)) continue;
      const key = `${z.id}:${ev.id}`;
      if (alertKey.has(key)) continue;
      alertKey.add(key);
      // createdAt defaults to now() — this is when the alert fired, not when the quake occurred.
      newAlerts.push({
        userId: z.userId,
        watchZoneId: z.id,
        eventId: ev.id,
        magnitude: ev.magnitude,
      });
    }
  }
  await chunked(newAlerts, (b) => db.alertLog.createMany({ data: b }));

  revalidatePath("/admin");
  revalidatePath("/admin/system");
  revalidatePath("/app");
  return { ok: true, newEvents: newRows.length, newAlerts: newAlerts.length };
}
