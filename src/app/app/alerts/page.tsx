import { BellOff } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { AlertsList, type AlertRow } from "./alerts-list";

export const metadata = { title: "Alerts" };

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
        title="Alerts"
        description="Events that matched one of your watch zones."
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="No alerts yet"
          body="When an earthquake occurs inside one of your watch zones above its alert threshold, it shows up here."
          action={
            <ButtonLink href="/app/zones" size="sm">
              Set up a watch zone
            </ButtonLink>
          }
        />
      ) : (
        <AlertsList initial={rows} />
      )}
    </Container>
  );
}
