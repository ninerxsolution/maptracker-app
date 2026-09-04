import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { getCurrentUser } from "@/lib/auth/current-user";

const navLinks = [
  { href: "/explore", label: "สำรวจ" },
  { href: "/#features", label: "ฟีเจอร์" },
  { href: "/#data", label: "ข้อมูล" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  const dashboardHref = user?.role === "ADMIN" ? "/admin" : "/app";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <ButtonLink href={dashboardHref} size="sm" variant="secondary">
                <LayoutDashboard className="h-4 w-4" />
                แดชบอร์ด
              </ButtonLink>
              <Link
                href={dashboardHref}
                className="rounded-full transition-transform hover:scale-105"
                aria-label="บัญชีของคุณ"
              >
                <Avatar name={user.name} />
              </Link>
            </>
          ) : (
            <>
              <ButtonLink
                href="/login"
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex"
              >
                เข้าสู่ระบบ
              </ButtonLink>
              <ButtonLink href="/register" size="sm">
                เริ่มใช้งาน
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
