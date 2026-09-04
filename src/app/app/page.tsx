import Link from "next/link";
import {
  Radar,
  Bookmark,
  BellRing,
  Activity,
  Plus,
  ArrowRight,
  MapPinned,
} from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { fetchQuakes } from "@/lib/usgs";
import { quakesInZones, type ZoneLike } from "@/lib/zones";
import { relativeTime } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { MagBadge } from "@/components/quakes/mag-badge";
import { RelativeTime } from "@/components/ui/relative-time";
import MapView from "@/components/map/map-view";

export const metadata = { title: "แดชบอร์ด" };

export default async function DashboardPage() {
  const user = await requireUser();

  const [zones, bookmarksCount, unread, recentAlerts, recentBookmarks] =
    await Promise.all([
      db.watchZone.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.bookmark.count({ where: { userId: user.id } }),
      db.alertLog.count({ where: { userId: user.id, readAt: null } }),
      db.alertLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { event: true, watchZone: true },
      }),
      db.bookmark.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const zoneLikes: ZoneLike[] = zones;
  const mapZones = zones.map((z) => ({
    id: z.id,
    name: z.name,
    centerLat: z.centerLat,
    centerLng: z.centerLng,
    radiusKm: z.radiusKm,
    color: z.color,
  }));

  // Personalized feed: recent quakes inside the user's zones.
  let inZone: ReturnType<typeof quakesInZones> = [];
  if (zoneLikes.length > 0) {
    try {
      // M2.5+ over the last week — enough for the glance without pulling the full feed.
      const { quakes } = await fetchQuakes("week", 2.5);
      inZone = quakesInZones(quakes, zoneLikes);
    } catch {
      inZone = [];
    }
  }

  const firstName = user.name.split(" ")[0];

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title={`ยินดีต้อนรับกลับ ${firstName}`}
        description="ภาพรวมการเฝ้าระวังแผ่นดินไหวของคุณ"
        actions={
          <ButtonLink href="/app/zones" size="sm">
            <Plus className="h-4 w-4" />
            โซนเฝ้าระวังใหม่
          </ButtonLink>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="โซนเฝ้าระวัง" value={zones.length} icon={Radar} />
        <StatTile
          label="บุ๊กมาร์ก"
          value={bookmarksCount}
          icon={Bookmark}
          accent="success"
        />
        <StatTile
          label="การแจ้งเตือนที่ยังไม่อ่าน"
          value={unread}
          icon={BellRing}
          accent={unread > 0 ? "danger" : "muted"}
        />
        <StatTile
          label="กิจกรรมในโซน (7 วัน)"
          value={inZone.length}
          icon={Activity}
          accent="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: zones map + in-zone feed */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                โซนเฝ้าระวังของคุณ
              </CardTitle>
              <Link
                href="/app/zones"
                className="text-sm text-primary hover:underline"
              >
                จัดการ
              </Link>
            </CardHeader>
            {zones.length === 0 ? (
              <div className="p-5 pt-0">
                <EmptyState
                  icon={Radar}
                  title="ยังไม่มีโซนเฝ้าระวัง"
                  body="สร้างโซนครอบคลุมพื้นที่ที่คุณสนใจ เพื่อติดตามการเกิดแผ่นดินไหวและรับการแจ้งเตือน"
                  action={
                    <ButtonLink href="/app/zones" size="sm">
                      <Plus className="h-4 w-4" />
                      สร้างโซน
                    </ButtonLink>
                  }
                />
              </div>
            ) : (
              <div className="h-72 w-full border-t border-border">
                <MapView quakes={inZone} zones={mapZones} />
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-warning" />
                กิจกรรมล่าสุดในโซนของคุณ
              </CardTitle>
            </CardHeader>
            <div className="px-2 pb-2">
              {inZone.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  {zones.length === 0
                    ? "สร้างโซนเพื่อเริ่มติดตามกิจกรรม"
                    : "ไม่มีเหตุการณ์ที่เข้าเกณฑ์ในโซนของคุณสัปดาห์นี้ — เงียบสงบ"}
                </p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {inZone.slice(0, 6).map((q) => (
                    <li
                      key={q.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                    >
                      <MagBadge mag={q.mag} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">
                          {q.place ?? "ไม่ทราบตำแหน่ง"}
                        </p>
                        <p className="text-xs text-faint">
                          <RelativeTime value={q.time} />
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>

        {/* Right: alerts + bookmarks */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-danger" />
                การแจ้งเตือนล่าสุด
              </CardTitle>
              <Link
                href="/app/alerts"
                className="text-sm text-primary hover:underline"
              >
                ทั้งหมด
              </Link>
            </CardHeader>
            <div className="px-2 pb-2">
              {recentAlerts.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  ยังไม่มีการแจ้งเตือน
                </p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {recentAlerts.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                      <MagBadge mag={a.magnitude} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">
                          {a.event.place ?? "ไม่ทราบตำแหน่ง"}
                        </p>
                        <p className="truncate text-xs text-faint">
                          {a.watchZone.name} · {relativeTime(a.createdAt)}
                        </p>
                      </div>
                      {!a.readAt && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-danger" />
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-success" />
                บุ๊กมาร์ก
              </CardTitle>
              <Link
                href="/app/bookmarks"
                className="text-sm text-primary hover:underline"
              >
                ทั้งหมด
              </Link>
            </CardHeader>
            <div className="px-2 pb-2">
              {recentBookmarks.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  ยังไม่มีบุ๊กมาร์ก{" "}
                  <Link href="/explore" className="text-primary hover:underline">
                    สำรวจแผนที่
                  </Link>
                </p>
              ) : (
                <ul className="divide-y divide-border/50">
                  {recentBookmarks.map((b) => (
                    <li key={b.id} className="flex items-center gap-3 px-3 py-2.5">
                      <MagBadge mag={b.magnitude} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-fg">
                          {b.place ?? "ไม่ทราบตำแหน่ง"}
                        </p>
                        <p className="truncate text-xs text-faint">
                          {relativeTime(b.occurredAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>

          <ButtonLink href="/explore" variant="outline" className="w-full">
            เปิดแผนที่สด
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
