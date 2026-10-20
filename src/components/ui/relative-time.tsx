"use client";

import { useSyncExternalStore } from "react";
import { relativeTime } from "@/lib/format";

const noopSubscribe = () => () => {};

/**
 * Renders a relative timestamp ("2 ชั่วโมงที่แล้ว") only on the client. Server
 * and hydration render empty, so a moving "now" never causes a mismatch.
 */
export function RelativeTime({
  value,
  className,
}: {
  value: number | string | Date | null | undefined;
  className?: string;
}) {
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return <span className={className}>{isClient ? relativeTime(value) : ""}</span>;
}
