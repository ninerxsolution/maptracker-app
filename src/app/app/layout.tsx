import { requireUser } from "@/lib/auth/current-user";

// Full authenticated shell (sidebar/nav) is built in the user-dashboard work.
// For now this layout enforces the auth gate as defense-in-depth behind middleware.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return <>{children}</>;
}
