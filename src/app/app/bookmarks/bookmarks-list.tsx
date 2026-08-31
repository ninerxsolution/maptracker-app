"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Trash2,
  StickyNote,
  Pencil,
  Check,
  X,
  MapPin,
  ArrowDownToLine,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MagBadge } from "@/components/quakes/mag-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import { updateBookmarkNote, deleteBookmark } from "../actions";

export type BookmarkRow = {
  id: string;
  eventId: string;
  magnitude: number | null;
  place: string | null;
  latitude: number;
  longitude: number;
  depthKm: number | null;
  occurredAt: string | Date;
  note: string | null;
};

export function BookmarksList({ initial }: { initial: BookmarkRow[] }) {
  const [items, setItems] = useState(initial);

  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((b) => (
        <BookmarkCard
          key={b.id}
          bookmark={b}
          onRemoved={() => setItems((xs) => xs.filter((x) => x.id !== b.id))}
          onNoteSaved={(note) =>
            setItems((xs) =>
              xs.map((x) => (x.id === b.id ? { ...x, note } : x)),
            )
          }
        />
      ))}
    </div>
  );
}

function BookmarkCard({
  bookmark: b,
  onRemoved,
  onNoteSaved,
}: {
  bookmark: BookmarkRow;
  onRemoved: () => void;
  onNoteSaved: (note: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(b.note ?? "");
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const usgsUrl = `https://earthquake.usgs.gov/earthquakes/eventpage/${b.eventId}`;

  function saveNote() {
    startTransition(async () => {
      const res = await updateBookmarkNote(b.id, note);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      onNoteSaved(note.trim() || null);
      setEditing(false);
      toast.success("Note saved.");
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await deleteBookmark(b.id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success("Bookmark removed.");
      onRemoved();
    });
  }

  return (
    <Card className="flex flex-col p-4">
      <div className="flex items-start gap-3">
        <MagBadge mag={b.magnitude} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-fg">
            {b.place ?? "Unknown location"}
          </p>
          <p className="text-xs text-faint">
            <RelativeTime value={b.occurredAt} />
          </p>
        </div>
        <button
          onClick={() => setConfirming(true)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint hover:bg-surface-2 hover:text-danger"
          aria-label="Remove bookmark"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {b.latitude.toFixed(2)}, {b.longitude.toFixed(2)}
        </span>
        {b.depthKm != null && (
          <span className="inline-flex items-center gap-1">
            <ArrowDownToLine className="h-3.5 w-3.5" />
            {b.depthKm.toFixed(0)} km
          </span>
        )}
      </div>

      {/* Note */}
      <div className="mt-3 flex-1">
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Add your observations…"
              className="w-full resize-none rounded-xl border border-border bg-surface-2 p-2.5 text-sm text-fg placeholder:text-faint focus:border-primary focus-visible:outline-none"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveNote} loading={pending}>
                {!pending && <Check className="h-3.5 w-3.5" />}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNote(b.note ?? "");
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : b.note ? (
          <button
            onClick={() => setEditing(true)}
            className="group flex w-full items-start gap-2 rounded-xl border border-border bg-surface-2/50 p-2.5 text-left"
          >
            <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span className="flex-1 text-sm text-muted">{b.note}</span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 text-sm text-faint transition-colors hover:text-primary"
          >
            <StickyNote className="h-3.5 w-3.5" />
            Add a note
          </button>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
        <a
          href={usgsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          View on USGS
          <ExternalLink className="h-3 w-3" />
        </a>
        {confirming && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-danger">Remove?</span>
            <Button size="sm" variant="danger" loading={pending} onClick={remove}>
              Yes
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              No
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
