"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  RefreshCw,
  Activity,
  TriangleAlert,
  Users,
  Radio,
  SearchX,
  ServerCrash,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import type { Quake, QuakeResponse } from "@/lib/usgs";
import { summarize } from "@/lib/usgs";
import type { TimeWindow } from "@/lib/constants";
import { compactNumber } from "@/lib/format";
import { formatMagnitude } from "@/lib/magnitude";
import { RelativeTime } from "@/components/ui/relative-time";
import { Segmented } from "@/components/ui/segmented";
import { QuakeListItem } from "@/components/quakes/quake-list-item";
import { QuakeDetail } from "@/components/quakes/quake-detail";
import { BookmarkButton } from "@/components/quakes/bookmark-button";
import { QuakeLegend } from "@/components/map/quake-legend";
import { Spinner } from "@/components/ui/spinner";
import MapView, { type MapFocus } from "@/components/map/map-view";
import { cn } from "@/lib/utils";

const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: "hour", label: "ชั่วโมง" },
  { value: "day", label: "วัน" },
  { value: "week", label: "สัปดาห์" },
  { value: "month", label: "เดือน" },
];

const MAG_OPTIONS = [
  { value: "0", label: "ทั้งหมด" },
  { value: "2.5", label: "2.5+" },
  { value: "4.5", label: "4.5+" },
  { value: "6", label: "6+" },
];

function StatChip({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2/60 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-faint">
        <Icon className="h-3.5 w-3.5" style={accent ? { color: accent } : undefined} />
        {label}
      </div>
      <p className="mt-1 font-display text-xl font-bold tabular text-fg">{value}</p>
    </div>
  );
}

export function ExploreClient({
  initial,
  isAuthed,
  bookmarkedIds = [],
}: {
  initial: QuakeResponse;
  isAuthed: boolean;
  bookmarkedIds?: string[];
}) {
  const [win, setWin] = useState<TimeWindow>(initial.window);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(bookmarkedIds),
  );
  const [minMag, setMinMag] = useState<string>("2.5");
  const [all, setAll] = useState<Quake[]>(initial.quakes);
  const [generated, setGenerated] = useState<number>(initial.generated);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapFocus>(null);

  const didMount = useRef(false);
  const reqId = useRef(0);

  const load = useCallback(
    async (w: TimeWindow, silent = false) => {
      const my = ++reqId.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/quakes?window=${w}&minMag=0`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as QuakeResponse;
        if (my !== reqId.current) return; // a newer request superseded this one
        setAll(data.quakes);
        setGenerated(data.generated);
      } catch {
        if (my === reqId.current) {
          setError("ไม่สามารถเชื่อมต่อฟีด USGS ได้ กำลังลองใหม่ในไม่ช้า…");
        }
      } finally {
        if (my === reqId.current) setLoading(false);
      }
    },
    [],
  );

  // Refetch when the time window changes (skip the very first render — we have SSR data).
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    load(win);
  }, [win, load]);

  // Auto-refresh every 60s (USGS regenerates each minute).
  useEffect(() => {
    const id = setInterval(() => load(win, true), 60_000);
    return () => clearInterval(id);
  }, [win, load]);

  const minMagNum = Number(minMag);
  const quakes = useMemo(
    () => all.filter((q) => (q.mag ?? -Infinity) >= minMagNum),
    [all, minMagNum],
  );
  const stats = useMemo(() => summarize(quakes), [quakes]);
  const selected = useMemo(
    () => quakes.find((q) => q.id === selectedId) ?? null,
    [quakes, selectedId],
  );

  const onSelect = useCallback((q: Quake) => {
    setSelectedId(q.id);
    setFocus({ lat: q.lat, lng: q.lng, zoom: 6 });
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* ---------------- Sidebar ---------------- */}
      <aside className="flex min-h-0 flex-col border-b border-border bg-surface/40 lg:w-[384px] lg:border-b-0 lg:border-r">
        <div className="shrink-0 border-b border-border/70 p-4">
          <div className="flex items-center justify-between">
            <h1 className="flex items-center gap-2 font-display text-lg font-bold text-fg">
              <Radio className="h-4 w-4 text-primary" />
              แผ่นดินไหวสด
            </h1>
            <button
              onClick={() => load(win)}
              disabled={loading}
              className="grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg disabled:opacity-50"
              aria-label="รีเฟรช"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-faint">
            <span className="live-dot" />
            {quakes.length.toLocaleString()} เหตุการณ์ · อัปเดตเมื่อ{" "}
            <RelativeTime value={generated} />
          </p>

          <div className="mt-4 space-y-2.5">
            <Segmented
              value={win}
              onChange={setWin}
              options={WINDOW_OPTIONS}
              size="sm"
              ariaLabel="ช่วงเวลา"
            />
            <Segmented
              value={minMag}
              onChange={setMinMag}
              options={MAG_OPTIONS}
              size="sm"
              ariaLabel="ขนาดขั้นต่ำ"
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <StatChip
              icon={Activity}
              label="สูงสุด"
              value={stats.maxMag ? `M${formatMagnitude(stats.maxMag)}` : "—"}
              accent="var(--color-primary)"
            />
            <StatChip
              icon={TriangleAlert}
              label="มีนัยสำคัญ"
              value={compactNumber(stats.significant)}
              accent="var(--color-warning)"
            />
            <StatChip
              icon={Users}
              label="รายงานการรู้สึก"
              value={compactNumber(stats.felt)}
              accent="var(--color-success)"
            />
          </div>
        </div>

        {/* scroll area: detail (if any) + list */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {selected && (
            <div className="border-b border-border/70 bg-surface-2/40 p-4">
              <QuakeDetail
                quake={selected}
                onClose={() => setSelectedId(null)}
                actions={
                  isAuthed ? (
                    <BookmarkButton
                      key={selected.id}
                      quake={selected}
                      saved={savedIds.has(selected.id)}
                      onToggled={(s) =>
                        setSavedIds((prev) => {
                          const next = new Set(prev);
                          if (s) next.add(selected.id);
                          else next.delete(selected.id);
                          return next;
                        })
                      }
                    />
                  ) : undefined
                }
              />
            </div>
          )}

          {error ? (
            <EmptyState
              icon={ServerCrash}
              title="ปัญหาการเชื่อมต่อ"
              body={error}
              action={
                <button
                  onClick={() => load(win)}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  ลองอีกครั้ง
                </button>
              }
            />
          ) : quakes.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="ไม่มีเหตุการณ์ที่ตรงกัน"
              body="ไม่มีแผ่นดินไหวในช่วงเวลานี้ที่ขนาดที่เลือก ลองขยายตัวกรอง"
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {quakes.slice(0, 200).map((q) => (
                <li key={q.id}>
                  <QuakeListItem
                    quake={q}
                    selected={q.id === selectedId}
                    onSelect={onSelect}
                  />
                </li>
              ))}
              {quakes.length > 200 && (
                <li className="px-3 py-3 text-center text-xs text-faint">
                  แสดง 200 เหตุการณ์ล่าสุดจากทั้งหมด{" "}
                  {quakes.length.toLocaleString()} เหตุการณ์ ทั้งหมด{" "}
                  แสดงบนแผนที่
                </li>
              )}
            </ul>
          )}
        </div>

        {!isAuthed && (
          <div className="shrink-0 border-t border-border/70 p-4">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <LogIn className="h-4 w-4" />
              เข้าสู่ระบบเพื่อบันทึกเหตุการณ์และโซนเฝ้าระวัง
            </Link>
          </div>
        )}
      </aside>

      {/* ---------------- Map ---------------- */}
      <div className="relative min-h-[55vh] flex-1 lg:min-h-0">
        <MapView
          quakes={quakes}
          selectedId={selectedId}
          onSelect={onSelect}
          focus={focus}
        />
        <QuakeLegend className="absolute bottom-3 left-3 z-[500]" />
        <div
          className="pointer-events-none absolute right-3 top-3 z-[500]"
          role="status"
          aria-live="polite"
        >
          {loading && (
            <span className="glass inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs text-muted">
              <Spinner className="h-3.5 w-3.5 text-primary" />
              กำลังอัปเดต…
            </span>
          )}
        </div>
        <p className="pointer-events-none absolute bottom-1 right-2 z-[500] text-[10px] text-faint/70">
          ข้อมูล: USGS · ไทล์: CARTO/OSM
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: typeof SearchX;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-surface-2 text-faint">
        <Icon className="h-5 w-5" />
      </span>
      <p className="text-sm font-medium text-fg">{title}</p>
      <p className="max-w-xs text-xs text-muted">{body}</p>
      {action}
    </div>
  );
}
