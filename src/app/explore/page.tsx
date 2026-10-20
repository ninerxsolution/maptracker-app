import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchQuakes, type QuakeResponse } from "@/lib/usgs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "สำรวจแผ่นดินไหวสด",
  description:
    "แผนที่โลกแบบโต้ตอบแสดงแผ่นดินไหวล่าสุด อัปเดตทุกนาทีจาก USGS Earthquake Hazards Program",
};

async function loadInitialQuakes(): Promise<QuakeResponse> {
  try {
    return await fetchQuakes("day", 0);
  } catch {
    return { quakes: [], generated: Date.now(), count: 0, window: "day", minMag: 0 };
  }
}

export default async function ExplorePage() {
  const user = await getCurrentUser();
  const initial = await loadInitialQuakes();

  let bookmarkedIds: string[] = [];
  if (user) {
    const bms = await db.bookmark.findMany({
      where: { userId: user.id },
      select: { eventId: true },
    });
    bookmarkedIds = bms.map((b) => b.eventId);
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Logo />
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg sm:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            หน้าแรก
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <ButtonLink
                href={user.role === "ADMIN" ? "/admin" : "/app"}
                size="sm"
                variant="secondary"
              >
                แดชบอร์ด
              </ButtonLink>
              <Avatar name={user.name} />
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                เข้าสู่ระบบ
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                เริ่มใช้งาน
              </ButtonLink>
            </>
          )}
        </div>
      </header>

      <ExploreClient
        initial={initial}
        isAuthed={!!user}
        bookmarkedIds={bookmarkedIds}
      />
    </div>
  );
}
