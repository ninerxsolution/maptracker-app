"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Plus,
  Radar,
  Pencil,
  Trash2,
  MapPin,
  Check,
  X,
  MousePointerClick,
} from "lucide-react";
import type { Quake } from "@/lib/usgs";
import { REGION_PRESETS, ZONE_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { EmptyState } from "@/components/ui/empty-state";
import MapView, { type MapFocus } from "@/components/map/map-view";
import { createZone, updateZone, deleteZone, type ZoneRow } from "../actions";
import { cn } from "@/lib/utils";

type Mode = "idle" | "create" | "edit";

const MAG_OPTS = [
  { value: "2.5", label: "2.5+" },
  { value: "4", label: "4+" },
  { value: "4.5", label: "4.5+" },
  { value: "5", label: "5+" },
  { value: "6", label: "6+" },
];

const emptyForm = {
  name: "",
  center: null as { lat: number; lng: number } | null,
  radiusKm: 400,
  minMagnitude: "4",
  color: ZONE_COLORS[0] as string,
};

export function ZonesManager({
  initialZones,
  quakes,
}: {
  initialZones: ZoneRow[];
  quakes: Quake[];
}) {
  const [zones, setZones] = useState<ZoneRow[]>(initialZones);
  const [mode, setMode] = useState<Mode>("idle");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [focus, setFocus] = useState<MapFocus>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const mapZones = useMemo(
    () =>
      zones
        .filter((z) => z.id !== editingId)
        .map((z) => ({
          id: z.id,
          name: z.name,
          centerLat: z.centerLat,
          centerLng: z.centerLng,
          radiusKm: z.radiusKm,
          color: z.color,
        })),
    [zones, editingId],
  );

  const draft =
    mode !== "idle" && form.center
      ? {
          lat: form.center.lat,
          lng: form.center.lng,
          radiusKm: form.radiusKm,
          color: form.color,
        }
      : null;

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setMode("create");
  }

  function startEdit(z: ZoneRow) {
    setForm({
      name: z.name,
      center: { lat: z.centerLat, lng: z.centerLng },
      radiusKm: z.radiusKm,
      minMagnitude: String(z.minMagnitude),
      color: z.color,
    });
    setEditingId(z.id);
    setMode("edit");
    setFocus({ lat: z.centerLat, lng: z.centerLng, zoom: 5 });
  }

  function cancel() {
    setMode("idle");
    setEditingId(null);
    setForm(emptyForm);
  }

  function pickPreset(p: (typeof REGION_PRESETS)[number]) {
    setForm((f) => ({
      ...f,
      center: { lat: p.lat, lng: p.lng },
      name: f.name || p.name,
    }));
    setFocus({ lat: p.lat, lng: p.lng, zoom: 5 });
  }

  function handleMapClick(lat: number, lng: number) {
    if (mode === "idle") return;
    setForm((f) => ({ ...f, center: { lat, lng } }));
  }

  function save() {
    if (!form.center) {
      toast.error("กำหนดจุดศูนย์กลาง — คลิกบนแผนที่หรือเลือกภูมิภาค");
      return;
    }
    if (!form.name.trim()) {
      toast.error("ตั้งชื่อให้โซนของคุณ");
      return;
    }
    const input = {
      name: form.name.trim(),
      centerLat: form.center.lat,
      centerLng: form.center.lng,
      radiusKm: form.radiusKm,
      minMagnitude: Number(form.minMagnitude),
      color: form.color,
    };

    startTransition(async () => {
      const res =
        mode === "edit" && editingId
          ? await updateZone(editingId, input)
          : await createZone(input);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      if (mode === "edit" && editingId) {
        setZones((zs) => zs.map((z) => (z.id === editingId ? res.zone : z)));
        toast.success("อัปเดตโซนแล้ว");
      } else {
        setZones((zs) => [res.zone, ...zs]);
        toast.success("สร้างโซนเฝ้าระวังแล้ว");
      }
      cancel();
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deleteZone(id);
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      setZones((zs) => zs.filter((z) => z.id !== id));
      setConfirmId(null);
      if (editingId === id) cancel();
      toast.success("ลบโซนแล้ว");
    });
  }

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Panel */}
      <div className="flex min-h-0 shrink-0 flex-col border-b border-border lg:w-[380px] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-border/70 p-4">
          <div>
            <h1 className="flex items-center gap-2 font-display text-lg font-bold text-fg">
              <Radar className="h-4 w-4 text-primary" />
              โซนเฝ้าระวัง
            </h1>
            <p className="text-xs text-faint">ตั้งค่าไว้ {zones.length} รายการ</p>
          </div>
          {mode === "idle" && (
            <Button size="sm" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              ใหม่
            </Button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {mode === "idle" ? (
            zones.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  icon={Radar}
                  title="ไม่มีโซนเฝ้าระวัง"
                  body="สร้างโซนครอบคลุมพื้นที่เพื่อติดตามการเกิดแผ่นดินไหวในบริเวณนั้น"
                  action={
                    <Button size="sm" onClick={startCreate}>
                      <Plus className="h-4 w-4" />
                      สร้างโซน
                    </Button>
                  }
                />
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {zones.map((z) => (
                  <li key={z.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 h-3 w-3 shrink-0 rounded-full"
                        style={{ background: z.color, boxShadow: `0 0 8px ${z.color}` }}
                      />
                      <button
                        onClick={() =>
                          setFocus({ lat: z.centerLat, lng: z.centerLng, zoom: 5 })
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-sm font-medium text-fg">
                          {z.name}
                        </p>
                        <p className="text-xs text-faint">
                          {z.radiusKm.toLocaleString()} km · M{z.minMagnitude}+
                        </p>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startEdit(z)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
                          aria-label="แก้ไขโซน"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmId(z.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-danger"
                          aria-label="ลบโซน"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    {confirmId === z.id && (
                      <div className="mt-2 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 p-2 text-xs">
                        <span className="flex-1 text-danger">ลบโซนนี้?</span>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={pending}
                          onClick={() => remove(z.id)}
                        >
                          ลบ
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                        >
                          ยกเลิก
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <ZoneForm
              form={form}
              setForm={setForm}
              mode={mode}
              pending={pending}
              onPreset={pickPreset}
              onSave={save}
              onCancel={cancel}
            />
          )}
        </div>
      </div>

      {/* Map */}
      <div className="relative min-h-[50vh] flex-1 lg:min-h-0">
        {mode !== "idle" && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-[500] -translate-x-1/2">
            <span className="glass inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-1.5 text-xs text-fg">
              <MousePointerClick className="h-3.5 w-3.5 text-primary" />
              คลิกบนแผนที่เพื่อวางจุดศูนย์กลางโซน
            </span>
          </div>
        )}
        <MapView
          quakes={quakes}
          zones={mapZones}
          draft={draft}
          focus={focus}
          onMapClick={mode !== "idle" ? handleMapClick : undefined}
        />
      </div>
    </div>
  );
}

function ZoneForm({
  form,
  setForm,
  mode,
  pending,
  onPreset,
  onSave,
  onCancel,
}: {
  form: typeof emptyForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>;
  mode: Mode;
  pending: boolean;
  onPreset: (p: (typeof REGION_PRESETS)[number]) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      <p className="text-sm font-semibold text-fg">
        {mode === "edit" ? "แก้ไขโซน" : "โซนเฝ้าระวังใหม่"}
      </p>

      <TextField
        label="ชื่อโซน"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        placeholder="เช่น พื้นที่บ้าน"
        name="name"
      />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-fg">จุดศูนย์กลาง</label>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm">
          <MapPin className="h-4 w-4 text-faint" />
          {form.center ? (
            <span className="tabular text-fg">
              {form.center.lat.toFixed(2)}, {form.center.lng.toFixed(2)}
            </span>
          ) : (
            <span className="text-faint">คลิกบนแผนที่หรือเลือกภูมิภาค</span>
          )}
        </div>
        <select
          aria-label="ไปยังภูมิภาคที่กำหนดไว้"
          className="mt-2 h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus-visible:outline-none"
          value=""
          onChange={(e) => {
            const p = REGION_PRESETS.find((r) => r.name === e.target.value);
            if (p) onPreset(p);
          }}
        >
          <option value="">ไปยังภูมิภาค…</option>
          {REGION_PRESETS.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-fg">
          <span>รัศมี</span>
          <span className="tabular text-muted">
            {form.radiusKm.toLocaleString()} km
          </span>
        </label>
        <input
          type="range"
          min={25}
          max={2000}
          step={25}
          value={form.radiusKm}
          onChange={(e) =>
            setForm((f) => ({ ...f, radiusKm: Number(e.target.value) }))
          }
          aria-label="รัศมีโซนเป็นกิโลเมตร"
          aria-valuetext={`${form.radiusKm} km`}
          className="w-full accent-[var(--color-primary)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-fg">
          เกณฑ์แจ้งเตือน
        </label>
        <Segmented
          value={form.minMagnitude}
          onChange={(v) => setForm((f) => ({ ...f, minMagnitude: v }))}
          options={MAG_OPTS}
          size="sm"
          ariaLabel="ขนาดเกณฑ์แจ้งเตือน"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-fg">สี</label>
        <div className="flex flex-wrap gap-2">
          {ZONE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className={cn(
                "h-8 w-8 rounded-lg transition-transform hover:scale-110",
                form.color === c && "ring-2 ring-white ring-offset-2 ring-offset-surface",
              )}
              style={{ background: c }}
              aria-label={`สี ${c}`}
            >
              {form.color === c && (
                <Check className="mx-auto h-4 w-4 text-black/70" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button className="flex-1" onClick={onSave} loading={pending}>
          {!pending && <Check className="h-4 w-4" />}
          {mode === "edit" ? "บันทึกการเปลี่ยนแปลง" : "สร้างโซน"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={pending}>
          <X className="h-4 w-4" />
          ยกเลิก
        </Button>
      </div>
    </div>
  );
}
