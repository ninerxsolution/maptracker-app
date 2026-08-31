import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth/current-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";

// Placeholder admin home — replaced by the full backoffice in a later change.
export default async function AdminHome() {
  const user = await requireAdmin();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo href="/admin" />
            <Badge variant="danger">Admin</Badge>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <LogoutButton />
          </div>
        </Container>
      </header>

      <Container className="py-16">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-fg">
            Admin access confirmed
          </h1>
          <p className="mt-2 text-sm text-muted">
            Welcome, {user.name}. The backoffice — analytics, user management and
            moderation — is coming next.
          </p>
        </Card>
      </Container>
    </div>
  );
}
