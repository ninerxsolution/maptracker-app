import { Waves } from "lucide-react";
import { magnitudeColor, magnitudeRadius, formatMagnitude } from "@/lib/magnitude";
import { RelativeTime } from "@/components/ui/relative-time";

export type PreviewEvent = {
  lat: number;
  lng: number;
  mag: number | null;
  place: string | null;
  time: number;
};

// Decorative fallback dots (used if the live feed is unavailable).
const fallback = [
  { top: "22%", left: "18%", color: "var(--color-mag-minor)", size: 8, delay: "0s" },
  { top: "38%", left: "34%", color: "var(--color-mag-moderate)", size: 12, delay: "0.6s" },
  { top: "58%", left: "26%", color: "var(--color-mag-light)", size: 9, delay: "1.1s" },
  { top: "30%", left: "62%", color: "var(--color-mag-strong)", size: 16, delay: "0.3s" },
  { top: "64%", left: "72%", color: "var(--color-mag-major)", size: 20, delay: "0.9s" },
  { top: "48%", left: "84%", color: "var(--color-mag-minor)", size: 8, delay: "1.4s" },
  { top: "72%", left: "48%", color: "var(--color-mag-moderate)", size: 11, delay: "0.2s" },
];

// Equirectangular projection — must match the --world-map bbox (lng ±180, lat ±85).
const LAT_EXTENT = 85;
function project(lat: number, lng: number) {
  const left = ((lng + 180) / 360) * 100;
  const top = ((LAT_EXTENT - lat) / (2 * LAT_EXTENT)) * 100;
  return { left: `${Math.min(99, Math.max(1, left))}%`, top: `${Math.min(98, Math.max(2, top))}%` };
}

export function MonitorPreview({ events }: { events?: PreviewEvent[] }) {
  const live = events && events.length > 0 ? events.slice(0, 9) : null;
  const latest = live?.[0];

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-xs text-muted">ฟีดสด · USGS</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-surface-3" />
          <span className="h-2 w-2 rounded-full bg-surface-3" />
          <span className="h-2 w-2 rounded-full bg-surface-3" />
        </div>
      </div>

      <div
        className="relative aspect-[36/17] w-full bg-map-bg"
        style={{ backgroundImage: "var(--world-map)", backgroundSize: "100% 100%" }}
        role="img"
        aria-label="แผนที่โลกแสดงตำแหน่งแผ่นดินไหวล่าสุด"
      >
        {live
          ? live.map((e, i) => {
              const pos = project(e.lat, e.lng);
              const color = magnitudeColor(e.mag);
              const size = magnitudeRadius(e.mag) * 0.9;
              return (
                <span
                  key={i}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: pos.top, left: pos.left }}
                >
                  <span
                    className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: size * 2.4,
                      height: size * 2.4,
                      background: color,
                      opacity: 0.45,
                      animation: `pulse-ring 2.6s ${(i % 5) * 0.3}s cubic-bezier(0.4,0,0.2,1) infinite`,
                    }}
                  />
                  <span
                    className="block rounded-full"
                    style={{ width: size, height: size, background: color, boxShadow: `0 0 12px ${color}` }}
                  />
                </span>
              );
            })
          : fallback.map((d, i) => (
              <span
                key={i}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ top: d.top, left: d.left }}
              >
                <span
                  className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: d.size * 2.4,
                    height: d.size * 2.4,
                    background: d.color,
                    opacity: 0.5,
                    animation: `pulse-ring 2.6s ${d.delay} cubic-bezier(0.4,0,0.2,1) infinite`,
                  }}
                />
                <span
                  className="block rounded-full"
                  style={{ width: d.size, height: d.size, background: d.color, boxShadow: `0 0 12px ${d.color}` }}
                />
              </span>
            ))}

        <span className="pointer-events-none absolute bottom-1 right-2 text-[9px] text-faint">
          © Esri
        </span>
      </div>

      <div className="border-t border-border/70 px-4 py-3">
        {latest ? (
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-sm font-semibold tabular"
              style={{ color: magnitudeColor(latest.mag) }}
            >
              M{formatMagnitude(latest.mag)}
            </span>
            <span className="truncate text-xs text-muted">
              {latest.place ?? "ไม่ทราบตำแหน่ง"}
            </span>
            <span className="ml-auto shrink-0 text-xs text-faint">
              <RelativeTime value={latest.time} />
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Waves className="h-4 w-4 shrink-0 text-primary" />
            <svg viewBox="0 0 400 40" className="h-8 w-full text-primary" preserveAspectRatio="none" aria-hidden>
              <polyline
                points="0,20 30,20 45,8 60,32 75,14 90,26 110,20 150,20 165,4 180,36 195,12 210,28 230,20 280,20 295,10 310,30 325,16 340,24 360,20 400,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
