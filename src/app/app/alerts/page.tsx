import { BellOff } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { AlertsList, type AlertRow } from "./alerts-list";

export const metadata = { title: "การแจ้งเตือน" };

export default async function AlertsPage() {
  const user = await requireUser();

  const alerts = await db.alertLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { event: true, watchZone: true },
  });

  const rows: AlertRow[] = alerts.map((a) => ({
    id: a.id,
    magnitude: a.magnitude,
    place: a.event.place,
    zoneName: a.watchZone.name,
    zoneColor: a.watchZone.color,
    createdAt: a.createdAt,
    read: a.readAt != null,
  }));

  return (
    <Container className="max-w-3xl space-y-6 py-6">
      <PageHeader
        title="การแจ้งเตือน"
        description="เหตุการณ์ที่ตรงกับโซนเฝ้าระวังของคุณ"
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="ยังไม่มีการแจ้งเตือน"
          body="เมื่อเกิดแผ่นดินไหวภายในโซนเฝ้าระวังของคุณเกินเกณฑ์แจ้งเตือน จะแสดงที่นี่"
          action={
            <ButtonLink href="/app/zones" size="sm">
              ตั้งค่าโซนเฝ้าระวัง
            </ButtonLink>
          }
        />
      ) : (
        <AlertsList initial={rows} />
      )}
    </Container>
  );
}
