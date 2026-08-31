import { formatDistanceToNowStrict } from "date-fns";

export function relativeTime(input: number | Date | null | undefined): string {
  if (input == null) return "—";
  const date = typeof input === "number" ? new Date(input) : input;
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export function dateTime(input: number | Date | null | undefined): string {
  if (input == null) return "—";
  const date = typeof input === "number" ? new Date(input) : input;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function compactNumber(n: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function depthLabel(depthKm: number | null | undefined): string {
  if (depthKm == null) return "—";
  return `${depthKm.toFixed(0)} km deep`;
}
