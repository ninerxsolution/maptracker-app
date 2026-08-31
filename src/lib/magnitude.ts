// Magnitude → colour / label / radius helpers, shared by the map, lists and legend.

export type MagBucket =
  | "minor"
  | "light"
  | "moderate"
  | "strong"
  | "major"
  | "great";

export function magnitudeBucket(mag: number | null | undefined): MagBucket {
  const m = mag ?? 0;
  if (m < 2.5) return "minor";
  if (m < 4.5) return "light";
  if (m < 6) return "moderate";
  if (m < 7) return "strong";
  if (m < 8) return "major";
  return "great";
}

export const MAG_COLORS: Record<MagBucket, string> = {
  minor: "#38bdf8",
  light: "#34d399",
  moderate: "#fbbf24",
  strong: "#fb923c",
  major: "#f87171",
  great: "#ef4444",
};

export const MAG_LABELS: Record<MagBucket, string> = {
  minor: "Minor",
  light: "Light",
  moderate: "Moderate",
  strong: "Strong",
  major: "Major",
  great: "Great",
};

export function magnitudeColor(mag: number | null | undefined): string {
  return MAG_COLORS[magnitudeBucket(mag)];
}

export function magnitudeLabel(mag: number | null | undefined): string {
  return MAG_LABELS[magnitudeBucket(mag)];
}

/** Marker radius in px, scaled by magnitude for the map. */
export function magnitudeRadius(mag: number | null | undefined): number {
  const m = mag ?? 0;
  return Math.max(4, Math.min(26, 3 + m * 2.6));
}

export function formatMagnitude(mag: number | null | undefined): string {
  return typeof mag === "number" ? mag.toFixed(1) : "—";
}

export const MAGNITUDE_SCALE: {
  bucket: MagBucket;
  label: string;
  range: string;
  color: string;
}[] = [
  { bucket: "minor", label: "Minor", range: "< 2.5", color: MAG_COLORS.minor },
  { bucket: "light", label: "Light", range: "2.5 – 4.4", color: MAG_COLORS.light },
  { bucket: "moderate", label: "Moderate", range: "4.5 – 5.9", color: MAG_COLORS.moderate },
  { bucket: "strong", label: "Strong", range: "6.0 – 6.9", color: MAG_COLORS.strong },
  { bucket: "major", label: "Major", range: "7.0 – 7.9", color: MAG_COLORS.major },
  { bucket: "great", label: "Great", range: "8.0 +", color: MAG_COLORS.great },
];
