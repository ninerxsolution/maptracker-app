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
import { MonitorPreview, type PreviewEvent } from "@/components/site/monitor-preview";
import { fetchQuakes } from "@/lib/usgs";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";

const features = [
  {
    icon: Globe2,
    title: "แผนที่โลกแบบสด",
    body: "ทุกแผ่นดินไหวที่ USGS เผยแพร่ แสดงผลบนแผนที่โลกแบบโต้ตอบภายในหนึ่งนาทีหลังตรวจพบ",
  },
  {
    icon: Radar,
    title: "โซนเฝ้าระวัง",
    body: "วาดพื้นที่วงกลมครอบบริเวณที่คุณสนใจ แล้วติดตามเฉพาะกิจกรรมแผ่นดินไหวภายในนั้น",
  },
  {
    icon: BellRing,
    title: "การแจ้งเตือนตามขนาด",
    body: "กำหนดเกณฑ์ขนาดสำหรับแต่ละโซน แล้วดูได้ทันทีว่าเหตุการณ์ใดจะแจ้งเตือนคุณ",
  },
  {
    icon: Bookmark,
    title: "บุ๊กมาร์กและบันทึก",
    body: "บันทึกเหตุการณ์สำคัญพร้อมข้อสังเกตของคุณ และกลับมาดูได้ทุกเมื่อ แม้หลังจากออกจากฟีดไปแล้ว",
  },
];

const magnitudeScale = [
  { label: "เล็กน้อย", range: "< 2.5", color: "var(--color-mag-minor)" },
  { label: "เบา", range: "2.5 – 4.4", color: "var(--color-mag-light)" },
  { label: "ปานกลาง", range: "4.5 – 5.9", color: "var(--color-mag-moderate)" },
  { label: "แรง", range: "6.0 – 6.9", color: "var(--color-mag-strong)" },
  { label: "รุนแรง", range: "7.0 – 7.9", color: "var(--color-mag-major)" },
  { label: "มหาศาล", range: "8.0 +", color: "var(--color-mag-great)" },
];

const highlights = [
  { icon: Zap, label: "หน่วงต่ำกว่าหนึ่งนาที" },
  { icon: Globe2, label: "ครอบคลุมทั่วโลก" },
  { icon: Database, label: "แหล่งข้อมูลทางการจาก USGS" },
  { icon: ShieldCheck, label: "ไม่ต้องใช้คีย์ API" },
];

export default async function HomePage() {
  let liveCount = 0;
  let events: PreviewEvent[] = [];
  try {
    const res = await fetchQuakes("day", 2.5);
    liveCount = res.count;
    events = res.quakes.slice(0, 9).map((q) => ({
      lat: q.lat,
      lng: q.lng,
      mag: q.mag,
      place: q.place,
      time: q.time,
    }));
  } catch {
    // fall back to the decorative preview
  }

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
                {liveCount > 0
                  ? `${liveCount.toLocaleString()} แผ่นดินไหวใน 24 ชม.ที่ผ่านมา`
                  : "ขับเคลื่อนด้วยข้อมูล USGS แบบสด"}
              </Badge>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-fg sm:text-5xl lg:text-6xl">
                ติดตามแผ่นดินไหว
                <br />
                <span className="text-gradient">ขณะที่โลกเคลื่อนตัว</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                MapTracker เปลี่ยนฟีดแผ่นดินไหวแบบเรียลไทม์ของ U.S. Geological
                Survey ให้กลายเป็นแผนที่ที่มีชีวิต เฝ้าระวังภูมิภาคที่คุณสนใจ
                บุ๊กมาร์กเหตุการณ์ และไม่พลาดกิจกรรมที่มีนัยสำคัญ
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ButtonLink href="/explore" size="lg">
                  สำรวจแผนที่
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/register" size="lg" variant="outline">
                  สร้างบัญชีฟรี
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
              <MonitorPreview events={events} />
            </div>
          </div>
        </section>

        {/* ---------------- Features ---------------- */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
                ทุกสิ่งที่คุณต้องมีเพื่อก้าวนำแผ่นดิน
              </h2>
              <p className="mt-4 text-muted">
                ตั้งแต่ภาพรวมทั่วโลกไปจนถึงถนนที่คุณอาศัยอยู่ — MapTracker
                ปรับขนาดตามระดับความใกล้ชิดที่คุณต้องการเฝ้าดู
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
                    ข้อมูล
                  </Badge>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                    ตรงจากแหล่งข้อมูล
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted">
                    MapTracker อ่านข้อมูลโดยตรงจาก{" "}
                    <a
                      href="https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      ฟีด USGS GeoJSON
                    </a>{" "}
                    ที่สร้างใหม่ทุกนาที ไม่มีตัวกลางบุคคลที่สาม ไม่มีแคชที่ล้าสมัย
                    — เป็นข้อมูลที่เชื่อถือได้ชุดเดียวกับที่นักแผ่นดินไหววิทยาใช้
                  </p>
                  <p className="mt-4 leading-relaxed text-muted">
                    เหตุการณ์ถูกกำหนดสีตามขนาด เพื่อให้อ่านระดับความรุนแรงได้ในพริบตา
                    ตั้งแต่แรงสั่นสะเทือนที่แทบรับรู้ไม่ได้ไปจนถึงแผ่นดินไหวขนาดมหึมา
                  </p>
                </Reveal>

                <Reveal delay={0.1}>
                  <div className="rounded-xl border border-border bg-bg/50 p-6">
                    <p className="mb-4 font-mono text-xs uppercase tracking-widest text-faint">
                      มาตราขนาด
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
                  เริ่มเฝ้าดูโลกของคุณ
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  สร้างบัญชีฟรีเพื่อตั้งค่าโซนเฝ้าระวัง บันทึกเหตุการณ์
                  และสร้างแดชบอร์ดแผ่นดินไหวส่วนตัวของคุณ
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/register" size="lg">
                    เริ่มใช้งาน — ฟรี
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/explore" size="lg" variant="outline">
                    แค่ดูแผนที่ก็พอ
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
