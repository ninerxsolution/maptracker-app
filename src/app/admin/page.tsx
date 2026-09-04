import { format, startOfDay, subDays } from "date-fns";
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Radar,
  Bookmark,
  Globe2,
  BellRing,
} from "lucide-react";
import { db } from "@/lib/db";
import { MAG_LABELS, MAG_COLORS, type MagBucket } from "@/lib/magnitude";
import { relativeTime } from "@/lib/format";
import { Container } from "@/components/ui/container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { SignupsAreaChart, MagnitudeBarChart } from "@/components/admin/charts";

export const metadata = { title: "ภาพรวมผู้ดูแลระบบ" };

const MAG_ORDER: MagBucket[] = [
  "minor",
  "light",
  "moderate",
  "strong",
  "major",
  "great",
];

export default async function AdminOverview() {
  const thirtyDaysAgo = subDays(new Date(), 30);
  const [
    userCount,
    activeCount,
    suspendedCount,
    adminCount,
    zoneCount,
    bookmarkCount,
    eventCount,
    alertCount,
    signupUsers,
    recentUsers,
    lastEvent,
    mMinor,
    mLight,
    mModerate,
    mStrong,
    mMajor,
    mGreat,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.user.count({ where: { role: "ADMIN" } }),
    db.watchZone.count(),
    db.bookmark.count(),
    db.seismicEvent.count(),
    db.alertLog.count(),
    db.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    db.seismicEvent.findFirst({
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    }),
    db.seismicEvent.count({ where: { magnitude: { lt: 2.5 } } }),
    db.seismicEvent.count({ where: { magnitude: { gte: 2.5, lt: 4.5 } } }),
    db.seismicEvent.count({ where: { magnitude: { gte: 4.5, lt: 6 } } }),
    db.seismicEvent.count({ where: { magnitude: { gte: 6, lt: 7 } } }),
    db.seismicEvent.count({ where: { magnitude: { gte: 7, lt: 8 } } }),
    db.seismicEvent.count({ where: { magnitude: { gte: 8 } } }),
  ]);

  // Signups over the last 30 days
  const dayCounts = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    dayCounts.set(format(startOfDay(subDays(new Date(), i)), "yyyy-MM-dd"), 0);
  }
  for (const u of signupUsers) {
    const key = format(startOfDay(u.createdAt), "yyyy-MM-dd");
    if (dayCounts.has(key)) dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const signups = [...dayCounts.entries()].map(([k, c]) => ({
    date: format(new Date(k), "MMM d"),
    count: c,
  }));

  // Events by magnitude bucket (counted DB-side, not materialized in memory)
  const magByBucket: Record<MagBucket, number> = {
    minor: mMinor,
    light: mLight,
    moderate: mModerate,
    strong: mStrong,
    major: mMajor,
    great: mGreat,
  };
  const magData = MAG_ORDER.map((b) => ({
    label: MAG_LABELS[b],
    count: magByBucket[b],
    color: MAG_COLORS[b],
  }));

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title="ภาพรวมแพลตฟอร์ม"
        description="การใช้งานและสถานะทั่วทั้ง MapTracker"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="ผู้ใช้ทั้งหมด" value={userCount} icon={Users} />
        <StatTile label="ใช้งาน" value={activeCount} icon={UserCheck} accent="success" />
        <StatTile label="ถูกระงับ" value={suspendedCount} icon={UserX} accent="danger" />
        <StatTile label="ผู้ดูแลระบบ" value={adminCount} icon={ShieldCheck} accent="primary" />
        <StatTile label="โซนเฝ้าระวัง" value={zoneCount} icon={Radar} accent="primary" />
        <StatTile label="บุ๊กมาร์ก" value={bookmarkCount} icon={Bookmark} accent="success" />
        <StatTile label="เหตุการณ์ที่ซิงก์" value={eventCount} icon={Globe2} accent="warning" />
        <StatTile label="การแจ้งเตือนที่เกิดขึ้น" value={alertCount} icon={BellRing} accent="danger" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>สมาชิกใหม่ · 30 วันล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <SignupsAreaChart data={signups} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>เหตุการณ์ที่ซิงก์ตามขนาด</CardTitle>
          </CardHeader>
          <CardContent>
            <MagnitudeBarChart data={magData} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>สมาชิกใหม่ล่าสุด</CardTitle>
            <span className="text-xs text-faint">
              ซิงก์ล่าสุด {lastEvent ? relativeTime(lastEvent.syncedAt) : "—"}
            </span>
          </CardHeader>
          <div className="px-2 pb-2">
            <ul className="divide-y divide-border/50">
              {recentUsers.map((u) => (
                <li key={u.id} className="flex items-center gap-3 px-3 py-2.5">
                  <Avatar name={u.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{u.name}</p>
                    <p className="truncate text-xs text-faint">{u.email}</p>
                  </div>
                  {u.role === "ADMIN" && <Badge variant="primary">ผู้ดูแลระบบ</Badge>}
                  <span className="text-xs text-faint">
                    {relativeTime(u.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>องค์ประกอบ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Ratio label="ใช้งาน" value={activeCount} total={userCount} color="var(--color-success)" />
            <Ratio label="ถูกระงับ" value={suspendedCount} total={userCount} color="var(--color-danger)" />
            <Ratio label="ผู้ดูแลระบบ" value={adminCount} total={userCount} color="var(--color-primary)" />
            <Ratio
              label="ผู้ใช้ที่มีโซนเฝ้าระวัง"
              value={zoneCount > 0 ? Math.min(userCount, zoneCount) : 0}
              total={userCount}
              color="var(--color-warning)"
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function Ratio({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-fg tabular">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
