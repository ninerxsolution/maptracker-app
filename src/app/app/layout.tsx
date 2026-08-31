import { requireUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unreadCount = await db.alertLog.count({
    where: { userId: user.id, readAt: null },
  });

  return (
    <AppShell
      user={{ name: user.name, email: user.email, role: user.role }}
      unreadCount={unreadCount}
    >
      {children}
    </AppShell>
  );
}
