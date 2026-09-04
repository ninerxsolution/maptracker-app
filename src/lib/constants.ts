// Shared domain constants. SQLite has no enums, so these string unions are the
// single source of truth, validated in the app layer.

export const ROLES = ["USER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export function isAdmin(role: string | undefined | null): boolean {
  return role === "ADMIN";
}

// USGS time-window feeds (level_period) — no API key required.
export const USGS_FEEDS = {
  hour: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  day: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  week: "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
  month:
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson",
} as const;

export type TimeWindow = keyof typeof USGS_FEEDS;

export const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: "hour", label: "1 ชั่วโมงล่าสุด" },
  { value: "day", label: "24 ชั่วโมงล่าสุด" },
  { value: "week", label: "7 วันล่าสุด" },
  { value: "month", label: "30 วันล่าสุด" },
];

// Seismically active places used as watch-zone presets / seed data.
export const REGION_PRESETS = [
  { name: "Tokyo, Japan", lat: 35.68, lng: 139.69 },
  { name: "Los Angeles, USA", lat: 34.05, lng: -118.24 },
  { name: "Santiago, Chile", lat: -33.45, lng: -70.66 },
  { name: "Jakarta, Indonesia", lat: -6.2, lng: 106.85 },
  { name: "Anchorage, Alaska", lat: 61.22, lng: -149.9 },
  { name: "Istanbul, Türkiye", lat: 41.01, lng: 28.98 },
  { name: "Manila, Philippines", lat: 14.6, lng: 120.98 },
  { name: "Mexico City, Mexico", lat: 19.43, lng: -99.13 },
  { name: "Wellington, New Zealand", lat: -41.29, lng: 174.78 },
  { name: "Athens, Greece", lat: 37.98, lng: 23.73 },
  { name: "Kathmandu, Nepal", lat: 27.7, lng: 85.32 },
  { name: "Reykjavík, Iceland", lat: 64.15, lng: -21.94 },
  { name: "Taipei, Taiwan", lat: 25.03, lng: 121.57 },
  { name: "Lima, Peru", lat: -12.05, lng: -77.04 },
  { name: "Tehran, Iran", lat: 35.69, lng: 51.39 },
  { name: "Kaikōura, New Zealand", lat: -42.4, lng: 173.68 },
] as const;

// Palette for user-drawn watch zones.
export const ZONE_COLORS = [
  "#38bdf8",
  "#34d399",
  "#fbbf24",
  "#fb923c",
  "#f87171",
  "#a78bfa",
  "#f472b6",
  "#2dd4bf",
] as const;
