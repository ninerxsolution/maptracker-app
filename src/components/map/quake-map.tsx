"use client";

import { useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Quake } from "@/lib/usgs";
import { magnitudeColor, magnitudeRadius, formatMagnitude } from "@/lib/magnitude";

export type MapZone = {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  color: string;
};

export type MapFocus = { lat: number; lng: number; zoom?: number } | null;

const MAX_MARKERS = 2500;

function FocusController({ focus }: { focus: MapFocus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.flyTo([focus.lat, focus.lng], focus.zoom ?? 6, { duration: 1.1 });
    }
  }, [focus, map]);
  return null;
}

export default function QuakeMap({
  quakes,
  selectedId,
  onSelect,
  focus = null,
  zones,
}: {
  quakes: Quake[];
  selectedId?: string | null;
  onSelect?: (q: Quake) => void;
  focus?: MapFocus;
  zones?: MapZone[];
}) {
  // Cap markers for performance, keeping the largest-magnitude events.
  const shown = useMemo(() => {
    if (quakes.length <= MAX_MARKERS) return quakes;
    return [...quakes]
      .sort((a, b) => (b.mag ?? 0) - (a.mag ?? 0))
      .slice(0, MAX_MARKERS);
  }, [quakes]);

  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={2}
      maxZoom={12}
      scrollWheelZoom
      worldCopyJump
      className="h-full w-full bg-[#0b0e14]"
      style={{ background: "#0b0e14" }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Esri, DeLorme, NAVTEQ'
        maxZoom={16}
      />

      {zones?.map((z) => (
        <Circle
          key={z.id}
          center={[z.centerLat, z.centerLng]}
          radius={z.radiusKm * 1000}
          pathOptions={{
            color: z.color,
            fillColor: z.color,
            fillOpacity: 0.05,
            weight: 1.5,
            dashArray: "4 4",
          }}
        />
      ))}

      {shown.map((q) => {
        const isSelected = q.id === selectedId;
        const color = magnitudeColor(q.mag);
        return (
          <CircleMarker
            key={q.id}
            center={[q.lat, q.lng]}
            radius={magnitudeRadius(q.mag)}
            pathOptions={{
              color: isSelected ? "#ffffff" : color,
              fillColor: color,
              fillOpacity: isSelected ? 0.9 : 0.55,
              weight: isSelected ? 2.5 : 1,
            }}
            eventHandlers={{ click: () => onSelect?.(q) }}
          >
            <Tooltip direction="top" offset={[0, -4]} opacity={1}>
              <span className="font-semibold">M {formatMagnitude(q.mag)}</span>
              {q.place ? ` · ${q.place}` : ""}
            </Tooltip>
          </CircleMarker>
        );
      })}

      <FocusController focus={focus} />
    </MapContainer>
  );
}
