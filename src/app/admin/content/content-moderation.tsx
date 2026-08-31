"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2, Radar, Bookmark } from "lucide-react";
import { Segmented } from "@/components/ui/segmented";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { MagBadge } from "@/components/quakes/mag-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { adminDeleteZone, adminDeleteBookmark } from "../actions";

export type ZoneMod = {
  id: string;
  name: string;
  radiusKm: number;
  minMagnitude: number;
  color: string;
  ownerName: string;
  ownerEmail: string;
  createdAt: string | Date;
};

export type BookmarkMod = {
  id: string;
  place: string | null;
  magnitude: number | null;
  note: string | null;
  ownerName: string;
  ownerEmail: string;
  occurredAt: string | Date;
};

export function ContentModeration({
  zones,
  bookmarks,
}: {
  zones: ZoneMod[];
  bookmarks: BookmarkMod[];
}) {
  const [tab, setTab] = useState<"zones" | "bookmarks">("zones");
  const [z, setZ] = useState(zones);
  const [b, setB] = useState(bookmarks);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function removeZone(id: string) {
    start(async () => {
      const res = await adminDeleteZone(id);
      if (!res.ok) { toast.error(res.error); return; }
      setZ((xs) => xs.filter((x) => x.id !== id));
      setConfirmId(null);
      toast.success("Zone removed.");
    });
  }
  function removeBookmark(id: string) {
    start(async () => {
      const res = await adminDeleteBookmark(id);
      if (!res.ok) { toast.error(res.error); return; }
      setB((xs) => xs.filter((x) => x.id !== id));
      setConfirmId(null);
      toast.success("Bookmark removed.");
    });
  }

  return (
    <div className="space-y-4">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { value: "zones", label: `Watch zones (${z.length})` },
          { value: "bookmarks", label: `Bookmarks (${b.length})` },
        ]}
        className="max-w-md"
      />

      {tab === "zones" ? (
        z.length === 0 ? (
          <EmptyState icon={Radar} title="No watch zones" />
        ) : (
          <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border">
            {z.map((zone) => (
              <li key={zone.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: zone.color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {zone.name}
                  </p>
                  <p className="truncate text-xs text-faint">
                    {zone.radiusKm.toLocaleString()} km · M{zone.minMagnitude}+ ·{" "}
                    {zone.ownerName} ({zone.ownerEmail})
                  </p>
                </div>
                <RemoveCell
                  confirming={confirmId === zone.id}
                  pending={pending}
                  onAsk={() => setConfirmId(zone.id)}
                  onCancel={() => setConfirmId(null)}
                  onConfirm={() => removeZone(zone.id)}
                />
              </li>
            ))}
          </ul>
        )
      ) : b.length === 0 ? (
        <EmptyState icon={Bookmark} title="No bookmarks" />
      ) : (
        <ul className="divide-y divide-border/50 overflow-hidden rounded-2xl border border-border">
          {b.map((bm) => (
            <li key={bm.id} className="flex items-center gap-3 px-4 py-3">
              <MagBadge mag={bm.magnitude} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">
                  {bm.place ?? "Unknown location"}
                </p>
                <p className="truncate text-xs text-faint">
                  {bm.ownerName} ({bm.ownerEmail}) ·{" "}
                  <RelativeTime value={bm.occurredAt} />
                  {bm.note ? ` · “${bm.note}”` : ""}
                </p>
              </div>
              <RemoveCell
                confirming={confirmId === bm.id}
                pending={pending}
                onAsk={() => setConfirmId(bm.id)}
                onCancel={() => setConfirmId(null)}
                onConfirm={() => removeBookmark(bm.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RemoveCell({
  confirming,
  pending,
  onAsk,
  onCancel,
  onConfirm,
}: {
  confirming: boolean;
  pending: boolean;
  onAsk: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (confirming) {
    return (
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="danger" loading={pending} onClick={onConfirm}>
          Delete
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <button
      onClick={onAsk}
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-danger"
      aria-label="Remove"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
