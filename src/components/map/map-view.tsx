"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/spinner";

export type { MapFocus, MapZone, MapDraft } from "./quake-map";

function MapSkeleton() {
  return (
    <div className="grid h-full w-full place-items-center bg-map-bg">
      <div className="flex flex-col items-center gap-3 text-muted">
        <Spinner className="h-6 w-6 text-primary" />
        <p className="text-sm">กำลังโหลดแผนที่…</p>
      </div>
    </div>
  );
}

// Leaflet touches `window`, so it must never render on the server.
const MapView = dynamic(() => import("./quake-map"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export default MapView;
