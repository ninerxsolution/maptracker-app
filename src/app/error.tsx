"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button, ButtonLink } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative">
        <Logo href="/" className="mx-auto mb-8" />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-danger/12 text-danger">
          <AlertTriangle className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold text-fg">
          เกิดข้อผิดพลาดบางอย่าง
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          เกิดข้อผิดพลาดที่ไม่คาดคิด คุณสามารถลองอีกครั้ง หรือกลับไปหน้าแรกได้
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            ลองอีกครั้ง
          </Button>
          <ButtonLink href="/" variant="outline">
            <Home className="h-4 w-4" />
            หน้าแรก
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
