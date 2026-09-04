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
        `ซิงก์เสร็จสิ้น — ${res.newEvents} เหตุการณ์ใหม่, ${res.newAlerts} การแจ้งเตือนใหม่`,
      );
      router.refresh();
    });
  }

  return (
    <Button onClick={run} loading={pending}>
      {!pending && <RefreshCw className="h-4 w-4" />}
      ซิงก์ตอนนี้
    </Button>
  );
}
