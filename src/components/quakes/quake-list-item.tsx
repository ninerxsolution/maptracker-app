"use client";

import { Waves } from "lucide-react";
import type { Quake } from "@/lib/usgs";
import { magnitudeColor } from "@/lib/magnitude";
import { depthLabel } from "@/lib/format";
import { RelativeTime } from "@/components/ui/relative-time";
import { MagBadge } from "./mag-badge";
import { cn } from "@/lib/utils";

export function QuakeListItem({
  quake,
  selected,
  onSelect,
}: {
  quake: Quake;
  selected?: boolean;
  onSelect?: (q: Quake) => void;
}) {
  const color = magnitudeColor(quake.mag);
  return (
    <button
      onClick={() => onSelect?.(quake)}
      aria-current={selected || undefined}
      className={cn(
        "flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left transition-colors",
        selected
          ? "bg-surface-2"
          : "border-l-transparent hover:bg-surface-2/60",
      )}
      style={selected ? { borderLeftColor: color } : undefined}
    >
      <MagBadge mag={quake.mag} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-fg">
          {quake.place ?? quake.title ?? "ไม่ทราบตำแหน่ง"}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-faint">
          <RelativeTime value={quake.time} />
          <span aria-hidden>·</span>
          <span>{depthLabel(quake.depth)}</span>
          {quake.tsunami ? (
            <span className="inline-flex items-center gap-0.5 text-primary">
              <Waves className="h-3 w-3" />
              สึนามิ
            </span>
          ) : null}
        </p>
      </div>
    </button>
  );
}
