import {
  Globe2,
  Radar,
  BellRing,
  Bookmark,
  Zap,
  Database,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { MonitorPreview } from "@/components/site/monitor-preview";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Globe2,
    title: "Live global map",
    body: "Every earthquake USGS publishes, rendered on an interactive world map within a minute of detection.",
  },
  {
    icon: Radar,
    title: "Watch zones",
    body: "Draw circular regions over the places you care about and monitor only the seismic activity inside them.",
  },
  {
    icon: BellRing,
    title: "Magnitude alerts",
    body: "Set a magnitude threshold per zone and instantly see which events would have alerted you.",
  },
  {
    icon: Bookmark,
    title: "Bookmarks & notes",
    body: "Save notable events with your own observations and revisit them any time — even after they leave the feed.",
  },
];

const magnitudeScale = [
  { label: "Minor", range: "< 2.5", color: "var(--color-mag-minor)" },
  { label: "Light", range: "2.5 – 4.4", color: "var(--color-mag-light)" },
  { label: "Moderate", range: "4.5 – 5.9", color: "var(--color-mag-moderate)" },
  { label: "Strong", range: "6.0 – 6.9", color: "var(--color-mag-strong)" },
  { label: "Major", range: "7.0 – 7.9", color: "var(--color-mag-major)" },
  { label: "Great", range: "8.0 +", color: "var(--color-mag-great)" },
];

const highlights = [
  { icon: Zap, label: "Sub-minute latency" },
  { icon: Globe2, label: "Worldwide coverage" },
  { icon: Database, label: "Official USGS source" },
  { icon: ShieldCheck, label: "No API keys required" },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />

      <main>
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24">
            <div className="animate-[fade-up_0.6s_both]">
              <Badge variant="primary" className="mb-5">
                <span className="live-dot" />
                Powered by live USGS data
              </Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                Track earthquakes
                <br />
                <span className="text-gradient">as the planet moves.</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                MapTracker turns the U.S. Geological Survey&apos;s real-time
                seismic feed into a living map. Watch the regions you care
                about, bookmark events, and never miss significant activity.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/explore" size="lg">
                  Explore the map
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/register" size="lg" variant="outline">
                  Create free account
                </ButtonLink>
              </div>

              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                {highlights.map((h) => (
                  <li
                    key={h.label}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <h.icon className="h-4 w-4 shrink-0 text-primary" />
                    {h.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="animate-[fade-up_0.7s_0.15s_both] lg:pl-6">
              <MonitorPreview />
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                Everything you need to stay ahead of the ground
              </h2>
              <p className="mt-4 text-muted">
                From a global overview to the streets you live on — MapTracker
                scales with how closely you want to watch.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 0.08}>
                  <Card interactive className="h-full p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary">
                      <f.icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-fg">
                      {f.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {f.body}
                    </p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Data / magnitude ---------------- */}
        <section id="data" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <Card className="overflow-hidden">
              <div className="grid gap-8 p-8 lg:grid-cols-2 lg:gap-12 lg:p-12">
                <Reveal>
                  <Badge variant="outline" className="mb-4">
                    <Database className="h-3.5 w-3.5" />
                    The data
                  </Badge>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                    Straight from the source
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted">
                    MapTracker reads directly from the{" "}
                    <a
                      href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      USGS GeoJSON feeds
                    </a>
                    , regenerated every minute. No third-party middlemen, no
                    stale caches — the same authoritative data seismologists use.
                  </p>
                  <p className="mt-4 leading-relaxed text-muted">
                    Events are colour-coded by magnitude so severity reads at a
                    glance, from barely-perceptible tremors to great quakes.
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-border bg-bg/50 p-6">
                    <p className="mb-4 font-mono text-xs uppercase tracking-widest text-faint">
                      Magnitude scale
                    </p>
                    <ul className="space-y-3">
                      {magnitudeScale.map((m) => (
                        <li key={m.label} className="flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full"
                            style={{
                              background: m.color,
                              boxShadow: `0 0 10px ${m.color}`,
                            }}
                          />
                          <span className="text-sm font-medium text-fg">
                            {m.label}
                          </span>
                          <span className="ml-auto font-mono text-sm text-muted tabular">
                            {m.range}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              </div>
            </Card>
          </div>
        </section>

        {/* ---------------- CTA ---------------- */}
        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/12 via-surface to-surface p-10 text-center sm:p-16">
              <div className="grid-bg absolute inset-0 opacity-40" aria-hidden />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                  Start watching your world
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  Create a free account to set up watch zones, save events, and
                  build your personal seismic dashboard.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/register" size="lg">
                    Get started — it&apos;s free
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/explore" size="lg" variant="outline">
                    Just show me the map
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
