"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ChevronDown,
  ExternalLink,
  Flag,
  RefreshCw,
  Search,
  SearchX,
  ServerCrash,
  TriangleAlert,
  Waves,
} from "lucide-react";
import type { CountryStat, SituationLevel } from "@/lib/countries";
import type { TimeWindow } from "@/lib/constants";
import { compactNumber, depthLabel } from "@/lib/format";
import { formatMagnitude } from "@/lib/magnitude";
import { Segmented } from "@/components/ui/segmented";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { MagBadge } from "@/components/quakes/mag-badge";
import { cn } from "@/lib/utils";

export type CountriesData =
  | { ok: true; stats: CountryStat[]; total: number; generated: number }
  | { ok: false };

type SortKey = "count" | "level" | "mag" | "recent";

const WINDOW_OPTIONS: { value: TimeWindow; label: string }[] = [
  { value: "day", label: "24 ชม." },
  { value: "week", label: "7 วัน" },
  { value: "month", label: "30 วัน" },
];
const MAG_OPTIONS = [
  { value: "0", label: "ทั้งหมด" },
  { value: "2.5", label: "2.5+" },
  { value: "4.5", label: "4.5+" },
];
const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "count", label: "จำนวน" },
  { value: "level", label: "ระดับ" },
  { value: "mag", label: "ขนาด" },
  { value: "recent", label: "ล่าสุด" },
];

const LEVEL: Record<
  SituationLevel,
  { label: string; variant: "danger" | "warning" | "success"; bar: string; rank: number }
> = {
  critical: { label: "รุนแรง", variant: "danger", bar: "bg-danger", rank: 3 },
  watch: { label: "เฝ้าระวัง", variant: "warning", bar: "bg-warning", rank: 2 },
  normal: { label: "ปกติ", variant: "success", bar: "bg-success", rank: 1 },
};

const COLS =
  "md:grid-cols-[2rem_minmax(0,1fr)_9rem_4.5rem_4.5rem_5rem_7.5rem_1.25rem]";

export function CountriesView({
  window,
  minMag,
  data,
}: {
  window: TimeWindow;
  minMag: number;
  data: CountriesData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("count");
  const [expanded, setExpanded] = useState<string | null>(null);

  function navigate(nextWindow: TimeWindow, nextMin: number) {
    setExpanded(null);
    startTransition(() => {
      router.replace(`/countries?window=${nextWindow}&minMag=${nextMin}`, {
        scroll: false,
      });
    });
  }

  const stats = useMemo(() => (data.ok ? data.stats : []), [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? stats.filter(
          (s) =>
            s.label.toLowerCase().includes(q) ||
            s.key.toLowerCase().includes(q) ||
            s.subregions.some((r) => r.name.toLowerCase().includes(q)),
        )
      : stats;
    const by: Record<SortKey, (a: CountryStat, b: CountryStat) => number> = {
      count: (a, b) => b.count - a.count,
      level: (a, b) => LEVEL[b.level].rank - LEVEL[a.level].rank || b.count - a.count,
      mag: (a, b) => (b.maxMag ?? 0) - (a.maxMag ?? 0),
      recent: (a, b) => b.latest - a.latest,
    };
    return [...filtered].sort(by[sort]);
  }, [stats, query, sort]);

  const summary = useMemo(() => {
    const countries = stats.filter((s) => !s.isOcean);
    const strongest = stats.reduce<CountryStat | null>(
      (best, s) => ((s.maxMag ?? -1) > (best?.maxMag ?? -1) ? s : best),
      null,
    );
    return {
      countries: countries.length,
      oceans: stats.length - countries.length,
      strongest,
      critical: stats.filter((s) => s.level === "critical").length,
      watch: stats.filter((s) => s.level === "watch").length,
      maxCount: Math.max(1, ...stats.map((s) => s.count)),
    };
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Segmented
          value={window}
          onChange={(w) => navigate(w, minMag)}
          options={WINDOW_OPTIONS}
          ariaLabel="ช่วงเวลา"
          className="sm:w-72"
        />
        <Segmented
          value={String(minMag)}
          onChange={(m) => navigate(window, Number(m))}
          options={MAG_OPTIONS}
          ariaLabel="ขนาดขั้นต่ำ"
          className="sm:w-60"
        />
        <p
          className="flex items-center gap-2 text-xs text-faint sm:ml-auto"
          role="status"
          aria-live="polite"
        >
          {pending ? (
            <>
              <Spinner className="h-3.5 w-3.5 text-primary" />
              กำลังโหลด…
            </>
          ) : data.ok ? (
            <>
              <span className="live-dot" />
              อัปเดตเมื่อ <RelativeTime value={data.generated} />
            </>
          ) : null}
        </p>
      </div>

      {!data.ok ? (
        <EmptyState
          icon={ServerCrash}
          title="เชื่อมต่อ USGS ไม่ได้"
          body="ไม่สามารถดึงข้อมูลแผ่นดินไหวได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง"
          action={
            <Button
              size="sm"
              variant="secondary"
              loading={pending}
              onClick={() => startTransition(() => router.refresh())}
            >
              {!pending && <RefreshCw className="h-4 w-4" />}
              ลองอีกครั้ง
            </Button>
          }
        />
      ) : (
        <div
          className={cn("space-y-6 transition-opacity", pending && "opacity-60")}
          aria-busy={pending}
        >
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile
              label="ประเทศที่มีเหตุการณ์"
              value={summary.countries}
              icon={Flag}
              hint={summary.oceans ? `+ ${summary.oceans} พื้นที่ทะเล/มหาสมุทร` : undefined}
            />
            <StatTile
              label="เหตุการณ์ทั้งหมด"
              value={data.total.toLocaleString()}
              icon={Activity}
              accent="success"
            />
            <StatTile
              label="ขนาดสูงสุด"
              value={
                summary.strongest?.maxMag != null
                  ? `M${formatMagnitude(summary.strongest.maxMag)}`
                  : "—"
              }
              icon={Waves}
              accent="warning"
              hint={summary.strongest?.label}
            />
            <StatTile
              label="ระดับรุนแรง"
              value={summary.critical}
              icon={TriangleAlert}
              accent={summary.critical ? "danger" : "muted"}
              hint={`เฝ้าระวังอีก ${summary.watch} แห่ง`}
            />
          </div>

          {/* Search + sort + legend */}
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหาประเทศหรือพื้นที่…"
                aria-label="ค้นหาประเทศหรือพื้นที่"
                className="pl-10"
              />
            </div>
            <Segmented
              value={sort}
              onChange={setSort}
              options={SORT_OPTIONS}
              size="sm"
              ariaLabel="เรียงตาม"
              className="lg:w-72"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs text-faint lg:ml-auto">
              <Badge variant="danger">รุนแรง</Badge> M6+ หรือ PAGER ส้ม/แดง
              <Badge variant="warning">เฝ้าระวัง</Badge> M4.5+ หรือสึนามิ
            </div>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title={stats.length ? "ไม่พบประเทศที่ค้นหา" : "ไม่มีเหตุการณ์ในช่วงนี้"}
              body={
                stats.length
                  ? "ลองค้นด้วยชื่อภาษาไทยหรืออังกฤษ เช่น ญี่ปุ่น หรือ Japan"
                  : "ลองขยายช่วงเวลาหรือลดขนาดขั้นต่ำ"
              }
            />
          ) : (
            <Card className="overflow-hidden">
              <div
                className={cn(
                  "hidden gap-3 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-faint md:grid",
                  COLS,
                )}
              >
                <span>#</span>
                <span>ประเทศ / พื้นที่</span>
                <span>จำนวนเหตุการณ์</span>
                <span>สูงสุด</span>
                <span>สำคัญ</span>
                <span>รู้สึก</span>
                <span>ล่าสุด</span>
                <span />
              </div>
              <ul aria-label="รายการประเทศ" className="divide-y divide-border/60">
                {rows.map((s, i) => (
                  <CountryRow
                    key={s.key}
                    stat={s}
                    rank={i + 1}
                    maxCount={summary.maxCount}
                    open={expanded === s.key}
                    onToggle={() => setExpanded(expanded === s.key ? null : s.key)}
                  />
                ))}
              </ul>
            </Card>
          )}

          <p className="text-xs text-faint">
            จัดกลุ่มจากชื่อสถานที่ที่ USGS ระบุ เหตุการณ์กลางทะเลแสดงตามชื่อพื้นที่ทางทะเล
            ส่วนรัฐของสหรัฐฯ และหมู่เกาะรวมไว้ใต้ประเทศเจ้าของ
          </p>
        </div>
      )}
    </div>
  );
}

function CountryRow({
  stat: s,
  rank,
  maxCount,
  open,
  onToggle,
}: {
  stat: CountryStat;
  rank: number;
  maxCount: number;
  open: boolean;
  onToggle: () => void;
}) {
  const level = LEVEL[s.level];
  const panelId = `country-${s.key.replace(/\W+/g, "-")}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          "grid w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2/60",
          COLS,
          open && "bg-surface-2/60",
        )}
      >
        <span className="hidden text-sm text-faint tabular md:block">{rank}</span>

        <span className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid h-8 w-10 shrink-0 place-items-center rounded-lg border border-border font-mono text-[11px] font-semibold",
              s.isOcean ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted",
            )}
            aria-hidden
          >
            {s.code ?? <Waves className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium text-fg">{s.label}</span>
              <Badge variant={level.variant} className="shrink-0">
                {level.label}
              </Badge>
              {s.tsunami > 0 && (
                <Waves
                  className="h-4 w-4 shrink-0 text-primary"
                  aria-label="มีธงเตือนสึนามิ"
                />
              )}
            </span>
            <span className="block truncate text-xs text-faint">
              {s.isOcean ? "พื้นที่ทะเล/มหาสมุทร · " : ""}
              {s.label !== s.key ? s.key : ""}
              {/* compact stats on mobile */}
              <span className="md:hidden">
                {s.label !== s.key || s.isOcean ? " · " : ""}
                {s.count} เหตุการณ์ · สูงสุด M{formatMagnitude(s.maxMag)} ·{" "}
                <RelativeTime value={s.latest} />
              </span>
            </span>
          </span>
        </span>

        <span className="hidden items-center gap-2 md:flex">
          <span className="w-8 text-right text-sm font-semibold text-fg tabular">
            {s.count}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
            <span
              className={cn("block h-full rounded-full opacity-70", level.bar)}
              style={{ width: `${Math.max(4, (s.count / maxCount) * 100)}%` }}
            />
          </span>
        </span>
        <span className="hidden md:block">
          <MagBadge mag={s.maxMag} size="sm" />
        </span>
        <span className="hidden text-sm text-muted tabular md:block">
          {s.significant || "—"}
        </span>
        <span className="hidden text-sm text-muted tabular md:block">
          {s.felt ? compactNumber(s.felt) : "—"}
        </span>
        <span className="hidden text-sm text-muted md:block">
          <RelativeTime value={s.latest} />
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-faint transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          id={panelId}
          className="animate-[fade-up_0.25s_both] space-y-4 border-t border-border/60 bg-surface-2/30 px-4 py-4 md:pl-16"
        >
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="text-muted">
              ขนาดสูงสุด{" "}
              <span className="font-semibold text-fg">M{formatMagnitude(s.maxMag)}</span>
              {s.maxPlace ? ` — ${s.maxPlace}` : ""}
            </span>
            {s.worstAlert && (
              <span className="text-muted">
                PAGER สูงสุด{" "}
                <span className="font-semibold capitalize text-fg">{s.worstAlert}</span>
              </span>
            )}
            {s.tsunami > 0 && (
              <span className="text-primary">ธงเตือนสึนามิ {s.tsunami} ครั้ง</span>
            )}
          </div>

          {s.subregions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-faint">พื้นที่ย่อย</span>
              {s.subregions.map((r) => (
                <Badge key={r.name} variant="outline">
                  {r.name} · {r.count}
                </Badge>
              ))}
            </div>
          )}

          <div>
            <p className="mb-2 text-xs font-medium text-faint">เหตุการณ์ล่าสุด</p>
            <ul className="divide-y divide-border/50 overflow-hidden rounded-xl border border-border bg-surface">
              {s.events.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-3 py-2.5">
                  <MagBadge mag={e.mag} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">{e.place ?? "ไม่ทราบตำแหน่ง"}</p>
                    <p className="text-xs text-faint">
                      <RelativeTime value={e.time} /> · {depthLabel(e.depth)}
                      {e.tsunami ? " · สึนามิ" : ""}
                    </p>
                  </div>
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-2 hover:text-primary"
                      aria-label="ดูบน USGS"
                      title="ดูบน USGS"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </li>
  );
}
