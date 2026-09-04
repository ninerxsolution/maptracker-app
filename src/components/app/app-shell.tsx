"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radar,
  Bookmark,
  Bell,
  Globe2,
  Menu,
  X,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  external?: boolean;
};

export function AppShell({
  user,
  unreadCount,
  children,
}: {
  user: { name: string; email: string; role: string };
  unreadCount: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const nav: NavItem[] = [
    { href: "/app", label: "แดชบอร์ด", icon: LayoutDashboard },
    { href: "/app/zones", label: "โซนเฝ้าระวัง", icon: Radar },
    { href: "/app/bookmarks", label: "บุ๊กมาร์ก", icon: Bookmark },
    { href: "/app/alerts", label: "การแจ้งเตือน", icon: Bell, badge: unreadCount },
    { href: "/explore", label: "แผนที่สด", icon: Globe2, external: true },
  ];

  function isActive(href: string) {
    return href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  }

  const sidebarInner = (
    <>
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href="/app" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(false)}
            className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {nav.map((item) => {
          const active = !item.external && isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-fg",
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-bg">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              ) : null}
              {item.external && (
                <span className="text-[10px] uppercase text-faint">↗</span>
              )}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
            <span className="flex-1">ผู้ดูแลระบบ</span>
            <span className="text-[10px] uppercase text-faint">↗</span>
          </Link>
        )}
      </nav>

      <div className="border-t border-border/70 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-fg">{user.name}</p>
            <p className="truncate text-xs text-faint">{user.email}</p>
          </div>
        </div>
        <LogoutButton className="mt-1 w-full justify-start" />
      </div>
    </>
  );

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface/40 lg:flex">
        {sidebarInner}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="app-drawer"
        role="dialog"
        aria-modal={mobileOpen}
        aria-label="เมนูนำทาง"
        inert={!mobileOpen}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarInner}
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4 lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-fg"
            aria-label="เปิดเมนู"
            aria-expanded={mobileOpen}
            aria-controls="app-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Logo href="/app" />
          <ThemeToggle className="ml-auto" />
        </div>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
