"use client";

import type { ReactNode } from "react";
import {
  X,
  ExternalLink,
  Clock,
  ArrowDownToLine,
  MapPin,
  Activity,
  Users,
  Waves,
  TriangleAlert,
} from "lucide-react";
import type { Quake } from "@/lib/usgs";
import { dateTime } from "@/lib/format";
import { magnitudeLabel } from "@/lib/magnitude";
import { RelativeTime } from "@/components/ui/relative-time";
import { MagBadge } from "./mag-badge";

const ALERT_COLORS: Record<string, string> = {
  green: "var(--color-success)",
  yellow: "var(--color-warning)",
  orange: "#fb923c",
  red: "var(--color-danger)",
};

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 py-2">
      <Icon className="h-4 w-4 shrink-0 text-faint" />
      <span className="text-sm text-muted">{label}</span>
      <span className="ml-auto text-sm font-medium text-fg tabular">{value}</span>
    </div>
  );
}

export function QuakeDetail({
  quake,
  onClose,
  actions,
}: {
  quake: Quake;
  onClose?: () => void;
  actions?: ReactNode;
}) {
  return (
    <div className="animate-[fade-up_0.3s_both]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <MagBadge mag={quake.mag} size="lg" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-faint">
              แผ่นดินไหวระดับ {magnitudeLabel(quake.mag)}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-fg">
              <RelativeTime value={quake.time} />
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="ปิดรายละเอียด"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-snug text-fg">
        {quake.place ?? quake.title ?? "ไม่ทราบตำแหน่ง"}
      </h3>

      <div className="mt-3 divide-y divide-border/60">
        <Row icon={Clock} label="เกิดเมื่อ" value={dateTime(quake.time)} />
        <Row
          icon={ArrowDownToLine}
          label="ความลึก"
          value={quake.depth != null ? `${quake.depth.toFixed(1)} km` : "—"}
        />
        <Row
          icon={MapPin}
          label="พิกัด"
          value={`${quake.lat.toFixed(2)}, ${quake.lng.toFixed(2)}`}
        />
        <Row
          icon={Activity}
          label="ประเภท"
          value={quake.magType?.toUpperCase() ?? "—"}
        />
        {quake.felt != null && (
          <Row
            icon={Users}
            label="รายงานการรู้สึก"
            value={quake.felt.toLocaleString()}
          />
        )}
        {quake.alert && (
          <Row
            icon={TriangleAlert}
            label="การแจ้งเตือน PAGER"
            value={
              <span
                className="capitalize"
                style={{ color: ALERT_COLORS[quake.alert] ?? undefined }}
              >
                {quake.alert}
              </span>
            }
          />
        )}
        {quake.tsunami ? (
          <Row
            icon={Waves}
            label="สึนามิ"
            value={<span className="text-primary">ถูกทำเครื่องหมาย</span>}
          />
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {actions}
        {quake.url && (
          <a
            href={quake.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border-strong px-4 text-sm font-medium text-fg transition-colors hover:border-primary/60 hover:bg-surface-2"
          >
            ดูบน USGS
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
