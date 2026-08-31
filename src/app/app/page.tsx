import { CheckCircle2, Map } from "lucide-react";
import { requireUser } from "@/lib/auth/current-user";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Logo } from "@/components/brand/logo";
import { LogoutButton } from "@/components/auth/logout-button";

// Placeholder dashboard — replaced by the full user dashboard in a later change.
export default async function AppHome() {
  const user = await requireUser();

  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3">
            <Avatar name={user.name} />
            <LogoutButton />
          </div>
        </Container>
      </header>

      <Container className="py-16">
        <Card className="mx-auto max-w-lg p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-success/12 text-success">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h1 className="mt-4 font-display text-2xl font-bold text-fg">
            You&apos;re signed in
          </h1>
          <p className="mt-2 text-sm text-muted">
            Welcome, {user.name}. Your personal dashboard — watch zones,
            bookmarks and alerts — is coming next.
          </p>
          <Badge variant="primary" className="mt-4">
            {user.role}
          </Badge>
          <div className="mt-6">
            <ButtonLink href="/explore">
              <Map className="h-4 w-4" />
              Explore the map
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </div>
  );
}
