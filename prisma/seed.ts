/**
 * MapTracker seed.
 *
 * Idempotent: wipes all rows, then recreates an admin + demo user + ~40 users,
 * ingests real USGS events (with a synthetic fallback if offline), and derives
 * watch zones, bookmarks, and alert logs from that data.
 *
 * Run: `npm run db:seed`   (or `npx prisma db seed`)
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { distanceKm } from "../src/lib/geo";
import { REGION_PRESETS, ZONE_COLORS } from "../src/lib/constants";

const db = new PrismaClient();

// Demo password for the seeded members. The admin password can be overridden via
// env for non-local use. These are demo credentials — never seed a real database.
const DEMO_PASSWORD = "password123";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? DEMO_PASSWORD;

// ----------------------------- helpers -----------------------------
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function sample<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}
async function chunkedCreate<T>(
  rows: T[],
  fn: (batch: T[]) => Promise<unknown>,
  size = 200,
) {
  for (let i = 0; i < rows.length; i += size) {
    await fn(rows.slice(i, i + size));
  }
}

// ----------------------------- USGS ingest -----------------------------
type UsgsFeature = {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    updated: number | null;
    magType: string | null;
    type: string | null;
    tsunami: number | null;
    felt: number | null;
    alert: string | null;
    sig: number | null;
    url: string | null;
  };
  geometry: { coordinates: [number, number, number] };
};

type EventRow = {
  id: string;
  magnitude: number | null;
  place: string | null;
  latitude: number;
  longitude: number;
  depthKm: number | null;
  occurredAt: Date;
  updatedAt: Date;
  magType: string | null;
  type: string;
  tsunami: number;
  felt: number | null;
  alert: string | null;
  significance: number | null;
  url: string | null;
  source: string;
};

const USGS_URLS = [
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson",
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson",
];

function featureToRow(f: UsgsFeature): EventRow | null {
  const c = f.geometry?.coordinates;
  const p = f.properties;
  if (!c || typeof c[1] !== "number" || typeof c[0] !== "number") return null;
  return {
    id: f.id,
    magnitude: p.mag,
    place: p.place,
    latitude: c[1],
    longitude: c[0],
    depthKm: typeof c[2] === "number" ? c[2] : null,
    occurredAt: new Date(p.time),
    updatedAt: new Date(p.updated ?? p.time),
    magType: p.magType,
    type: p.type ?? "earthquake",
    tsunami: p.tsunami ?? 0,
    felt: p.felt,
    alert: p.alert,
    significance: p.sig,
    url: p.url,
    source: "usgs",
  };
}

async function fetchUsgsEvents(): Promise<EventRow[]> {
  const byId = new Map<string, EventRow>();
  for (const url of USGS_URLS) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "MapTracker-seed/1.0" },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as { features: UsgsFeature[] };
      for (const f of json.features ?? []) {
        const row = featureToRow(f);
        if (row) byId.set(row.id, row);
      }
      console.log(`  ✓ ${url.split("/").pop()} → ${json.features?.length ?? 0} events`);
    } catch (err) {
      console.warn(`  ⚠ failed ${url}: ${(err as Error).message}`);
    }
  }
  return [...byId.values()];
}

function syntheticEvents(count = 450): EventRow[] {
  const rows: EventRow[] = [];
  for (let i = 0; i < count; i++) {
    const region = pick(REGION_PRESETS);
    const jitter = () => (Math.random() - 0.5) * 12;
    const roll = Math.random();
    // magnitude weighted toward the small end
    const mag =
      roll > 0.97
        ? 6 + Math.random() * 2
        : roll > 0.8
          ? 4.5 + Math.random() * 1.5
          : 2.5 + Math.random() * 2;
    const t = daysAgo(Math.random() * 30);
    rows.push({
      id: `synthetic-${i}-${t.getTime()}`,
      magnitude: Number(mag.toFixed(1)),
      place: `${randInt(5, 240)} km from ${region.name}`,
      latitude: region.lat + jitter(),
      longitude: region.lng + jitter(),
      depthKm: Number((Math.random() * 120 + 2).toFixed(1)),
      occurredAt: t,
      updatedAt: t,
      magType: "mww",
      type: "earthquake",
      tsunami: mag > 7 && Math.random() > 0.5 ? 1 : 0,
      felt: Math.random() > 0.7 ? randInt(1, 400) : null,
      alert: mag > 6.5 ? pick(["green", "yellow", "orange"]) : null,
      significance: Math.round(mag * mag * 25),
      url: "https://earthquake.usgs.gov/",
      source: "synthetic",
    });
  }
  return rows;
}

// ----------------------------- users -----------------------------
const FIRST = [
  "Aiko", "Mateo", "Sofia", "Liam", "Yuki", "Noah", "Emma", "Kenji", "Olivia",
  "Lucas", "Mia", "Hiroshi", "Ava", "Diego", "Ingrid", "Arjun", "Chloe",
  "Sven", "Priya", "Marco", "Lena", "Tomas", "Nadia", "Kai", "Elena",
  "Rafael", "Hana", "Oscar", "Amara", "Bjorn", "Rina", "Pablo", "Freya",
  "Sam", "Leila", "Andres", "Mei", "Iker", "Zara", "Tobias",
];
const LAST = [
  "Tanaka", "Garcia", "Nguyen", "Muller", "Rossi", "Kim", "Silva", "Johansson",
  "Patel", "Andersen", "Costa", "Haddad", "Novak", "Reyes", "Okafor",
  "Petrov", "Sato", "Larsen", "Mendoza", "Fischer", "Yamamoto", "Duarte",
];

function slugEmail(first: string, last: string, i: number): string {
  return `${first}.${last}${i}`.toLowerCase().replace(/[^a-z0-9.]/g, "") + "@example.com";
}

const NOTES = [
  "Felt this one from my apartment — swaying lasted several seconds.",
  "Watching this fault line closely after the recent swarm.",
  "Reference event for my thesis on subduction zones.",
  "Shallow depth, worth keeping an eye on aftershocks.",
  "Reported by a colleague on the ground.",
  "Unusual for this region — flagged for follow-up.",
  "Bookmarked for the community newsletter.",
  "Depth and magnitude combo suggests a tsunami check was warranted.",
];

// ----------------------------- main -----------------------------
async function main() {
  console.log("🌱 Seeding MapTracker…");

  if (process.env.NODE_ENV === "production" && ADMIN_PASSWORD === DEMO_PASSWORD) {
    console.warn(
      "⚠  Seeding a PRODUCTION database with the default demo password. " +
        "Set SEED_ADMIN_PASSWORD (and change member passwords) before any real deployment.",
    );
  }

  console.log("• Clearing existing data");
  await db.alertLog.deleteMany();
  await db.bookmark.deleteMany();
  await db.watchZone.deleteMany();
  await db.seismicEvent.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const adminHash =
    ADMIN_PASSWORD === DEMO_PASSWORD
      ? passwordHash
      : await bcrypt.hash(ADMIN_PASSWORD, 10);

  // --- events ---
  console.log("• Ingesting USGS events");
  let events = await fetchUsgsEvents();
  if (events.length < 50) {
    console.log("  → using synthetic fallback dataset");
    events = syntheticEvents();
  }
  await chunkedCreate(events, (batch) =>
    db.seismicEvent.createMany({ data: batch }),
  );
  console.log(`  ✓ ${events.length} seismic events stored`);

  // sort by magnitude desc for picking "notable" ones
  const notable = [...events]
    .filter((e) => (e.magnitude ?? 0) >= 5)
    .sort((a, b) => (b.magnitude ?? 0) - (a.magnitude ?? 0));

  // --- users ---
  console.log("• Creating users");
  await db.user.create({
    data: {
      email: "admin@maptracker.app",
      name: "Avery Admin",
      passwordHash: adminHash,
      role: "ADMIN",
      createdAt: daysAgo(90),
      lastLoginAt: daysAgo(0.2),
    },
  });

  const demo = await db.user.create({
    data: {
      email: "demo@maptracker.app",
      name: "Demo User",
      passwordHash,
      role: "USER",
      createdAt: daysAgo(45),
      lastLoginAt: daysAgo(0.5),
    },
  });

  const users = [demo];
  const usedEmails = new Set<string>(["admin@maptracker.app", "demo@maptracker.app"]);
  for (let i = 0; i < 40; i++) {
    const first = pick(FIRST);
    const last = pick(LAST);
    let email = slugEmail(first, last, i);
    while (usedEmails.has(email)) email = slugEmail(first, last, i + randInt(100, 999));
    usedEmails.add(email);
    const created = daysAgo(Math.random() * 85 + 1);
    const u = await db.user.create({
      data: {
        email,
        name: `${first} ${last}`,
        passwordHash,
        role: "USER",
        status: Math.random() > 0.94 ? "SUSPENDED" : "ACTIVE",
        createdAt: created,
        lastLoginAt: Math.random() > 0.25 ? daysAgo(Math.random() * 20) : null,
      },
    });
    users.push(u);
  }
  console.log(`  ✓ ${users.length + 1} users (1 admin, ${users.length} members)`);

  // --- watch zones ---
  console.log("• Creating watch zones");
  type ZoneRow = {
    id: string;
    userId: string;
    centerLat: number;
    centerLng: number;
    radiusKm: number;
    minMagnitude: number;
  };
  const createdZones: ZoneRow[] = [];

  async function makeZone(
    userId: string,
    region: (typeof REGION_PRESETS)[number],
    opts?: { radiusKm?: number; minMagnitude?: number },
    createdAt?: Date,
  ) {
    const z = await db.watchZone.create({
      data: {
        userId,
        name: region.name,
        centerLat: region.lat,
        centerLng: region.lng,
        radiusKm: opts?.radiusKm ?? randInt(250, 700),
        minMagnitude: opts?.minMagnitude ?? pick([3.5, 4, 4.5, 5]),
        color: pick(ZONE_COLORS),
        createdAt: createdAt ?? daysAgo(Math.random() * 40),
      },
    });
    createdZones.push({
      id: z.id,
      userId,
      centerLat: z.centerLat,
      centerLng: z.centerLng,
      radiusKm: z.radiusKm,
      minMagnitude: z.minMagnitude,
    });
  }

  // Demo user gets a rich, curated set
  for (const r of sample(REGION_PRESETS, 4)) {
    await makeZone(demo.id, r, { radiusKm: randInt(300, 600), minMagnitude: 4 });
  }
  // Members get 0–3 each
  for (const u of users) {
    if (u.id === demo.id) continue;
    const n = pick([0, 1, 1, 2, 2, 3]);
    for (const r of sample(REGION_PRESETS, n)) await makeZone(u.id, r);
  }
  console.log(`  ✓ ${createdZones.length} watch zones`);

  // --- bookmarks ---
  console.log("• Creating bookmarks");
  const bookmarkRows: {
    userId: string;
    eventId: string;
    magnitude: number | null;
    place: string | null;
    latitude: number;
    longitude: number;
    depthKm: number | null;
    occurredAt: Date;
    note: string | null;
    createdAt: Date;
  }[] = [];
  const bookmarkKey = new Set<string>();

  function addBookmark(userId: string, e: EventRow, withNote: boolean) {
    const key = `${userId}:${e.id}`;
    if (bookmarkKey.has(key)) return;
    bookmarkKey.add(key);
    bookmarkRows.push({
      userId,
      eventId: e.id,
      magnitude: e.magnitude,
      place: e.place,
      latitude: e.latitude,
      longitude: e.longitude,
      depthKm: e.depthKm,
      occurredAt: e.occurredAt,
      note: withNote ? pick(NOTES) : null,
      createdAt: daysAgo(Math.random() * 30),
    });
  }

  const bookmarkPool = notable.length >= 10 ? notable : events;
  for (const e of sample(bookmarkPool, Math.min(6, bookmarkPool.length)))
    addBookmark(demo.id, e, true);
  for (const u of users) {
    if (u.id === demo.id) continue;
    const n = pick([0, 0, 1, 2, 3]);
    for (const e of sample(bookmarkPool, n)) addBookmark(u.id, e, Math.random() > 0.5);
  }
  await chunkedCreate(bookmarkRows, (batch) =>
    db.bookmark.createMany({ data: batch }),
  );
  console.log(`  ✓ ${bookmarkRows.length} bookmarks`);

  // --- alert logs (match events to zones) ---
  console.log("• Deriving alert logs");
  const alertRows: {
    userId: string;
    watchZoneId: string;
    eventId: string;
    magnitude: number | null;
    createdAt: Date;
    readAt: Date | null;
  }[] = [];
  const alertKey = new Set<string>();

  for (const z of createdZones) {
    const matches = events
      .filter(
        (e) =>
          (e.magnitude ?? 0) >= z.minMagnitude &&
          distanceKm(z.centerLat, z.centerLng, e.latitude, e.longitude) <=
            z.radiusKm,
      )
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 8);

    for (const e of matches) {
      const key = `${z.id}:${e.id}`;
      if (alertKey.has(key)) continue;
      alertKey.add(key);
      alertRows.push({
        userId: z.userId,
        watchZoneId: z.id,
        eventId: e.id,
        magnitude: e.magnitude,
        createdAt: e.occurredAt,
        readAt: Math.random() > 0.5 ? daysAgo(Math.random() * 10) : null,
      });
    }
  }
  await chunkedCreate(alertRows, (batch) =>
    db.alertLog.createMany({ data: batch }),
  );
  console.log(`  ✓ ${alertRows.length} alert logs`);

  console.log("\n✅ Seed complete.");
  console.log(
    `   Admin  → admin@maptracker.app / ${ADMIN_PASSWORD === DEMO_PASSWORD ? DEMO_PASSWORD : "(SEED_ADMIN_PASSWORD)"}`,
  );
  console.log(`   Member → demo@maptracker.app  / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
