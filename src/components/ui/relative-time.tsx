"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "@/lib/format";

/**
 * Renders a relative timestamp ("2 hours ago") only after mount, so the server
 * and first client render agree (both empty) and hydration never mismatches on
 * a moving "now".
 */
export function RelativeTime({
  value,
  className,
}: {
  value: number | Date | null | undefined;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning className={className}>
      {mounted ? relativeTime(value) : ""}
    </span>
  );
}
