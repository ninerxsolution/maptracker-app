import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { fetchQuakes, type QuakeResponse } from "@/lib/usgs";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/current-user";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ExploreClient } from "./explore-client";

export const metadata: Metadata = {
  title: "Explore live earthquakes",
  description:
    "An interactive world map of recent earthquakes, updated every minute from the USGS Earthquake Hazards Program.",
};

export default async function ExplorePage() {
  const user = await getCurrentUser();

  let initial: QuakeResponse;
  try {
    initial = await fetchQuakes("day", 0);
  } catch {
    initial = {
      quakes: [],
      generated: Date.now(),
      count: 0,
      window: "day",
      minMag: 0,
    };
  }

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
            Home
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <ButtonLink
                href={user.role === "ADMIN" ? "/admin" : "/app"}
                size="sm"
                variant="secondary"
              >
                Dashboard
              </ButtonLink>
              <Avatar name={user.name} />
            </>
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                Get started
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
