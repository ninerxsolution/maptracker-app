import { requireAdmin } from "@/lib/auth/current-user";

// Full admin backoffice shell is built in the admin work. This gate enforces the
// ADMIN role as defense-in-depth behind middleware.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <>{children}</>;
}
