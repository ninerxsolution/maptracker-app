import { Bookmark } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ButtonLink } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { BookmarksList, type BookmarkRow } from "./bookmarks-list";

export const metadata = { title: "บุ๊กมาร์ก" };

export default async function BookmarksPage() {
  const user = await requireUser();

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const rows: BookmarkRow[] = bookmarks.map((b) => ({
    id: b.id,
    eventId: b.eventId,
    magnitude: b.magnitude,
    place: b.place,
    latitude: b.latitude,
    longitude: b.longitude,
    depthKm: b.depthKm,
    occurredAt: b.occurredAt,
    note: b.note,
  }));

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title="บุ๊กมาร์ก"
        description={`${rows.length} เหตุการณ์ที่บันทึกไว้`}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="ยังไม่มีบุ๊กมาร์ก"
          body="บันทึกแผ่นดินไหวที่น่าสนใจจากแผนที่สด เพื่อกลับมาดูที่นี่พร้อมโน้ตของคุณเอง"
          action={
            <ButtonLink href="/explore" size="sm">
              สำรวจแผนที่
            </ButtonLink>
          }
        />
      ) : (
        <BookmarksList initial={rows} />
      )}
    </Container>
  );
}
