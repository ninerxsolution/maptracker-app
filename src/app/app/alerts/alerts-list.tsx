"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCheck, Circle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MagBadge } from "@/components/quakes/mag-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { markAlertRead, markAllAlertsRead } from "../actions";
import { cn } from "@/lib/utils";

export type AlertRow = {
  id: string;
  magnitude: number | null;
  place: string | null;
  zoneName: string;
  zoneColor: string;
  createdAt: string | Date;
  read: boolean;
};

export function AlertsList({ initial }: { initial: AlertRow[] }) {
  const [alerts, setAlerts] = useState(initial);
  const [pending, startTransition] = useTransition();
  const unread = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

  function toggle(id: string, read: boolean) {
    // optimistic
    setAlerts((xs) => xs.map((a) => (a.id === id ? { ...a, read } : a)));
    startTransition(async () => {
      const res = await markAlertRead(id, read);
      if (!res.ok) {
        setAlerts((xs) => xs.map((a) => (a.id === id ? { ...a, read: !read } : a)));
        toast.error(res.error);
      }
    });
  }

  function markAll() {
    const prev = alerts;
    setAlerts((xs) => xs.map((a) => ({ ...a, read: true })));
    startTransition(async () => {
      const res = await markAllAlertsRead();
      if (!res.ok) {
        setAlerts(prev);
        toast.error(res.error);
      } else {
        toast.success("All alerts marked read.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {unread > 0 ? (
            <>
              <span className="font-semibold text-fg">{unread}</span> unread
            </>
          ) : (
            "All caught up"
          )}
        </p>
        <Button
          size="sm"
          variant="secondary"
          onClick={markAll}
          disabled={unread === 0 || pending}
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </Button>
      </div>

      <ul className="overflow-hidden rounded-2xl border border-border">
        {alerts.map((a, i) => (
          <li
            key={a.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 transition-colors",
              i > 0 && "border-t border-border/60",
              !a.read && "bg-primary/[0.04]",
            )}
          >
            <MagBadge mag={a.magnitude} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">
                {a.place ?? "Unknown location"}
              </p>
              <p className="flex items-center gap-1.5 text-xs text-faint">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: a.zoneColor }}
                />
                {a.zoneName}
                <span aria-hidden>·</span>
                <RelativeTime value={a.createdAt} />
              </p>
            </div>
            <button
              onClick={() => toggle(a.id, !a.read)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-lg transition-colors",
                a.read
                  ? "text-faint hover:bg-surface-2 hover:text-fg"
                  : "text-primary hover:bg-primary/10",
              )}
              aria-label={a.read ? "Mark unread" : "Mark read"}
              title={a.read ? "Mark unread" : "Mark read"}
            >
              {a.read ? (
                <Circle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
