import { requireAdmin } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/app/page-header";
import { UsersTable, type UserRow } from "./users-table";

export const metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const admin = await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { watchZones: true, bookmarks: true } } },
  });

  const rows: UserRow[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    zones: u._count.watchZones,
    bookmarks: u._count.bookmarks,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  }));

  return (
    <Container className="space-y-6 py-6">
      <PageHeader
        title="Users"
        description="Manage roles, suspend accounts, and remove members."
      />
      <UsersTable initial={rows} currentUserId={admin.id} />
    </Container>
  );
}
