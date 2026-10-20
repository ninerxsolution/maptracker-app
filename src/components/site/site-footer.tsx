import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted">
              เฝ้าติดตามแผ่นดินไหวทั่วโลกแบบเรียลไทม์บนแผนที่แบบโต้ตอบ
              เฝ้าระวังภูมิภาคที่คุณสนใจ
              และไม่พลาดกิจกรรมแผ่นดินไหวที่มีนัยสำคัญ
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="ผลิตภัณฑ์"
              links={[
                { href: "/explore", label: "สำรวจแผนที่" },
                { href: "/register", label: "สร้างบัญชี" },
                { href: "/login", label: "เข้าสู่ระบบ" },
              ]}
            />
            <FooterCol
              title="เรียนรู้"
              links={[
                { href: "/#features", label: "ฟีเจอร์" },
                { href: "/#data", label: "วิธีการทำงาน" },
              ]}
            />
            <div>
              <h4 className="text-sm font-semibold text-fg">แหล่งข้อมูล</h4>
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

        <p className="mt-10 border-t border-border/70 pt-6 text-center text-sm text-faint sm:text-left">
          © {new Date().getFullYear()} MapTracker
          ข้อมูลแผ่นดินไหวได้รับความอนุเคราะห์จาก U.S. Geological Survey
        </p>
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
