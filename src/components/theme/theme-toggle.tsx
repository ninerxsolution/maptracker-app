"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "สลับเป็นธีมสว่าง" : "สลับเป็นธีมมืด"}
      title={isDark ? "ธีมสว่าง" : "ธีมมืด"}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg",
        className,
      )}
    >
      <span suppressHydrationWarning className="grid place-items-center">
        {isDark ? (
          <Sun className="h-[1.15rem] w-[1.15rem]" />
        ) : (
          <Moon className="h-[1.15rem] w-[1.15rem]" />
        )}
      </span>
    </button>
  );
}
