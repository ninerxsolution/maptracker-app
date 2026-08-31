import { Compass, Home } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative">
        <Logo href="/" className="mx-auto mb-8" />
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-fg">
          Off the map
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-muted">
          We couldn&apos;t find that page. It may have moved, or never existed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">
            <Home className="h-4 w-4" />
            Home
          </ButtonLink>
          <ButtonLink href="/explore" variant="outline">
            <Compass className="h-4 w-4" />
            Explore the map
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
