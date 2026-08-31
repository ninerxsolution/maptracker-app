import { requireAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/app/page-header";
import {
  ContentModeration,
  type ZoneMod,
  type BookmarkMod,
} from "./content-moderation";

export const metadata = { title: "Content" };

export default async function AdminContentPage() {
  await requireAdmin();

  const [zones, bookmarks] = await Promise.all([
    db.watchZone.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    }),
    db.bookmark.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const zoneRows: ZoneMod[] = zones.map((z) => ({
    id: z.id,
    name: z.name,
    radiusKm: z.radiusKm,
    minMagnitude: z.minMagnitude,
    color: z.color,
    ownerName: z.user.name,
    ownerEmail: z.user.email,
    createdAt: z.createdAt,
  }));

  const bookmarkRows: BookmarkMod[] = bookmarks.map((b) => ({
    id: b.id,
    place: b.place,
    magnitude: b.magnitude,
    note: b.note,
    ownerName: b.user.name,
    ownerEmail: b.user.email,
    occurredAt: b.occurredAt,
  }));

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title="Content moderation"
        description="Review and remove watch zones and bookmarks across all accounts."
      />
      <ContentModeration zones={zoneRows} bookmarks={bookmarkRows} />
    </Container>
  );
}
