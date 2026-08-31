import { Waves } from "lucide-react";

/** Decorative hero visual — a stylised seismic monitor panel. */
const dots = [
  { top: "22%", left: "18%", color: "var(--color-mag-minor)", size: 8, delay: "0s" },
  { top: "38%", left: "34%", color: "var(--color-mag-moderate)", size: 12, delay: "0.6s" },
  { top: "58%", left: "26%", color: "var(--color-mag-light)", size: 9, delay: "1.1s" },
  { top: "30%", left: "62%", color: "var(--color-mag-strong)", size: 16, delay: "0.3s" },
  { top: "64%", left: "72%", color: "var(--color-mag-major)", size: 20, delay: "0.9s" },
  { top: "48%", left: "84%", color: "var(--color-mag-minor)", size: 8, delay: "1.4s" },
  { top: "72%", left: "48%", color: "var(--color-mag-moderate)", size: 11, delay: "0.2s" },
];

export function MonitorPreview() {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl shadow-black/40">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-xs text-muted">LIVE FEED · USGS</span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-surface-3" />
          <span className="h-2 w-2 rounded-full bg-surface-3" />
          <span className="h-2 w-2 rounded-full bg-surface-3" />
        </div>
      </div>

      {/* map field */}
      <div className="relative h-full w-full grid-bg">
        {dots.map((d, i) => (
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
              style={{
                width: d.size,
                height: d.size,
                background: d.color,
                boxShadow: `0 0 12px ${d.color}`,
              }}
            />
          </span>
        ))}

        {/* seismograph strip */}
        <div className="absolute inset-x-0 bottom-0 border-t border-border/70 bg-bg/60 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Waves className="h-4 w-4 shrink-0 text-primary" />
            <svg
              viewBox="0 0 400 40"
              className="h-8 w-full text-primary"
              preserveAspectRatio="none"
              aria-hidden
            >
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
        </div>
      </div>
    </div>
  );
}
