import {
  Database,
  Radio,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { fetchQuakes } from "@/lib/usgs";
import { relativeTime } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MagBadge } from "@/components/quakes/mag-badge";
import { PageHeader } from "@/components/app/page-header";
import { SyncButton } from "./sync-panel";

export const metadata = { title: "ระบบ" };

export default async function AdminSystemPage() {
  await requireAdmin();

  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const [eventCount, weekEvents, lastSynced, alertCount, recentAlerts] =
    await Promise.all([
      db.seismicEvent.count(),
      db.seismicEvent.count({ where: { occurredAt: { gte: weekAgo } } }),
      db.seismicEvent.findFirst({
        orderBy: { syncedAt: "desc" },
        select: { syncedAt: true },
      }),
      db.alertLog.count(),
      db.alertLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          event: { select: { place: true } },
          watchZone: { select: { name: true, color: true } },
          user: { select: { name: true } },
        },
      }),
    ]);

  let feedOk = false;
  let feedGenerated: number | null = null;
  try {
    const res = await fetchQuakes("day", 0);
    feedOk = true;
    feedGenerated = res.generated;
  } catch {
    feedOk = false;
  }

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title="ระบบและข้อมูล"
        description="สถานะการนำเข้าข้อมูล USGS และกิจกรรมการแจ้งเตือนล่าสุด"
        actions={<SyncButton />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              ไปป์ไลน์ข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Row
              icon={Radio}
              label="แหล่งข้อมูล"
              value="USGS Earthquake Hazards Program"
            />
            <Row
              icon={Activity}
              label="ฟีด"
              value="all_hour / all_day / all_week / all_month"
            />
            <Row
              icon={Database}
              label="เหตุการณ์ที่จัดเก็บ"
              value={eventCount.toLocaleString()}
            />
            <Row
              icon={Activity}
              label="เหตุการณ์ (7 วันล่าสุด)"
              value={weekEvents.toLocaleString()}
            />
            <Row
              icon={Clock}
              label="ซิงก์ล่าสุด"
              value={lastSynced ? relativeTime(lastSynced.syncedAt) : "—"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สถานะฟีด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              {feedOk ? (
                <>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-success/12 text-success">
                    <CheckCircle2 className="h-7 w-7" />
                  </span>
                  <div>
                    <Badge variant="success">ทำงานปกติ</Badge>
                    <p className="mt-2 text-xs text-faint">
                      ฟีด USGS สร้างเมื่อ{" "}
                      {feedGenerated ? relativeTime(feedGenerated) : "เร็วๆ นี้"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-danger/12 text-danger">
                    <AlertTriangle className="h-7 w-7" />
                  </span>
                  <Badge variant="danger">เชื่อมต่อไม่ได้</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>กิจกรรมการแจ้งเตือนล่าสุด</CardTitle>
          <span className="text-xs text-faint">
            ทั้งหมด {alertCount.toLocaleString()}
          </span>
        </CardHeader>
        <div className="px-2 pb-2">
          <ul className="divide-y divide-border/50">
            {recentAlerts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-3 py-2.5">
                <MagBadge mag={a.magnitude} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">
                    {a.event.place ?? "ไม่ทราบตำแหน่ง"}
                  </p>
                  <p className="flex items-center gap-1.5 truncate text-xs text-faint">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: a.watchZone.color }}
                    />
                    {a.watchZone.name} · {a.user.name} · {relativeTime(a.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </Container>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 shrink-0 text-faint" />
      <span className="text-sm text-muted">{label}</span>
      <span className="ml-auto text-sm font-medium text-fg">{value}</span>
    </div>
  );
}
