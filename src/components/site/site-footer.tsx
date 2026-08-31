import Link from "next/link";
import { Code2, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Real-time global earthquake monitoring on an interactive map.
              Watch the regions you care about and never miss significant
              seismic activity.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Product"
              links={[
                { href: "/explore", label: "Explore map" },
                { href: "/register", label: "Create account" },
                { href: "/login", label: "Sign in" },
              ]}
            />
            <FooterCol
              title="Learn"
              links={[
                { href: "/#features", label: "Features" },
                { href: "/#data", label: "How it works" },
              ]}
            />
            <div>
              <h4 className="text-sm font-semibold text-fg">Data source</h4>
              <a
                href="https://earthquake.usgs.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-primary"
              >
                USGS Earthquake Hazards
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/70 pt-6 text-sm text-faint sm:flex-row">
          <p>
            © {new Date().getFullYear()} MapTracker. Seismic data courtesy of the
            U.S. Geological Survey.
          </p>
          <a
            href="https://github.com/ninerxsolution/maptracker-app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-fg"
          >
            <Code2 className="h-4 w-4" />
            Source
          </a>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-fg">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-muted transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
