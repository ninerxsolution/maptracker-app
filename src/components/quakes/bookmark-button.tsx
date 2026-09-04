"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Bookmark, BookmarkCheck } from "lucide-react";
import type { Quake } from "@/lib/usgs";
import { toggleBookmark } from "@/app/app/actions";
import { cn } from "@/lib/utils";

export function BookmarkButton({
  quake,
  saved: initialSaved,
  onToggled,
}: {
  quake: Quake;
  saved: boolean;
  onToggled?: (saved: boolean) => void;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function onClick() {
    const next = !saved;
    setSaved(next); // optimistic
    startTransition(async () => {
      const res = await toggleBookmark({
        eventId: quake.id,
        magnitude: quake.mag,
        place: quake.place,
        latitude: quake.lat,
        longitude: quake.lng,
        depthKm: quake.depth,
        occurredAt: new Date(quake.time),
      });
      if (!res.ok) {
        setSaved(!next);
        toast.error(res.error);
        return;
      }
      setSaved(res.saved);
      onToggled?.(res.saved);
      toast.success(res.saved ? "บันทึกลงบุ๊กมาร์กแล้ว" : "ลบออกจากบุ๊กมาร์กแล้ว");
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-60",
        saved
          ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/20"
          : "border border-border-strong text-fg hover:border-primary/60 hover:bg-surface-2",
      )}
    >
      {saved ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {saved ? "บันทึกแล้ว" : "บันทึกเหตุการณ์"}
    </button>
  );
}
