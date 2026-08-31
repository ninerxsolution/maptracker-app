"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncNow } from "../actions";

export function SyncButton() {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run() {
    start(async () => {
      const res = await syncNow();
      if (!res.ok) {
        toast.error(res.error);
        return;
      }
      toast.success(
        `Sync complete — ${res.newEvents} new event${res.newEvents === 1 ? "" : "s"}, ${res.newAlerts} new alert${res.newAlerts === 1 ? "" : "s"}.`,
      );
      router.refresh();
    });
  }

  return (
    <Button onClick={run} loading={pending}>
      {!pending && <RefreshCw className="h-4 w-4" />}
      Sync now
    </Button>
  );
}
