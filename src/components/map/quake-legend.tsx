import { MAGNITUDE_SCALE } from "@/lib/magnitude";
import { cn } from "@/lib/utils";

export function QuakeLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "glass pointer-events-none rounded-xl border border-border/70 px-3 py-2",
        className,
      )}
    >
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-faint">
        Magnitude
      </p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {MAGNITUDE_SCALE.map((m) => (
          <span key={m.bucket} className="flex items-center gap-1.5 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: m.color, boxShadow: `0 0 6px ${m.color}` }}
            />
            <span className="text-muted">{m.range}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
