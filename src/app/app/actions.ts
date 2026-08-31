"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/current-user";
import {
  zoneSchema,
  noteSchema,
  bookmarkSchema,
  type ZoneInput,
  type BookmarkInput,
} from "@/lib/validators";

export type ActionResult<T = unknown> =
  | ({ ok: true } & T)
  | { ok: false; error: string };

export type ZoneRow = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  minMagnitude: number;
  color: string;
};

function toZoneRow(z: {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  minMagnitude: number;
  color: string;
}): ZoneRow {
  return {
    id: z.id,
    name: z.name,
    centerLat: z.centerLat,
    centerLng: z.centerLng,
    radiusKm: z.radiusKm,
    minMagnitude: z.minMagnitude,
    color: z.color,
  };
}

// ------------------------- Watch zones -------------------------
export async function createZone(
  input: ZoneInput,
): Promise<ActionResult<{ zone: ZoneRow }>> {
  const user = await requireUser();
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the zone details." };

  const zone = await db.watchZone.create({
    data: { ...parsed.data, userId: user.id },
  });
  revalidatePath("/app/zones");
  revalidatePath("/app");
  return { ok: true, zone: toZoneRow(zone) };
}

export async function updateZone(
  id: string,
  input: ZoneInput,
): Promise<ActionResult<{ zone: ZoneRow }>> {
  const user = await requireUser();
  const parsed = zoneSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check the zone details." };

  const owned = await db.watchZone.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });
  if (!owned) return { ok: false, error: "Zone not found." };

  const zone = await db.watchZone.update({ where: { id }, data: parsed.data });
  revalidatePath("/app/zones");
  revalidatePath("/app");
  return { ok: true, zone: toZoneRow(zone) };
}

export async function deleteZone(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const res = await db.watchZone.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return { ok: false, error: "Zone not found." };
  revalidatePath("/app/zones");
  revalidatePath("/app");
  return { ok: true };
}

// ------------------------- Bookmarks -------------------------
export async function toggleBookmark(
  input: BookmarkInput,
): Promise<ActionResult<{ saved: boolean }>> {
  const user = await requireUser();
  const parsed = bookmarkSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid event." };
  const data = parsed.data;

  const existing = await db.bookmark.findUnique({
    where: { userId_eventId: { userId: user.id, eventId: data.eventId } },
  });

  if (existing) {
    await db.bookmark.delete({ where: { id: existing.id } });
    revalidatePath("/app/bookmarks");
    revalidatePath("/app");
    return { ok: true, saved: false };
  }

  await db.bookmark.create({
    data: {
      userId: user.id,
      eventId: data.eventId,
      magnitude: data.magnitude ?? null,
      place: data.place ?? null,
      latitude: data.latitude,
      longitude: data.longitude,
      depthKm: data.depthKm ?? null,
      occurredAt: data.occurredAt,
    },
  });
  revalidatePath("/app/bookmarks");
  revalidatePath("/app");
  return { ok: true, saved: true };
}

export async function updateBookmarkNote(
  id: string,
  note: string,
): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = noteSchema.safeParse(note);
  if (!parsed.success) return { ok: false, error: "Note is too long." };

  const res = await db.bookmark.updateMany({
    where: { id, userId: user.id },
    data: { note: parsed.data.trim() || null },
  });
  if (res.count === 0) return { ok: false, error: "Bookmark not found." };
  revalidatePath("/app/bookmarks");
  return { ok: true };
}

export async function deleteBookmark(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const res = await db.bookmark.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return { ok: false, error: "Bookmark not found." };
  revalidatePath("/app/bookmarks");
  revalidatePath("/app");
  return { ok: true };
}

// ------------------------- Alerts -------------------------
export async function markAlertRead(
  id: string,
  read = true,
): Promise<ActionResult> {
  const user = await requireUser();
  const res = await db.alertLog.updateMany({
    where: { id, userId: user.id },
    data: { readAt: read ? new Date() : null },
  });
  if (res.count === 0) return { ok: false, error: "Alert not found." };
  revalidatePath("/app/alerts");
  revalidatePath("/app");
  return { ok: true };
}

export async function markAllAlertsRead(): Promise<ActionResult> {
  const user = await requireUser();
  await db.alertLog.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/app/alerts");
  revalidatePath("/app");
  return { ok: true };
}
