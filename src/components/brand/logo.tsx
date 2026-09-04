import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[#6366f1] text-primary-fg shadow-[0_6px_20px_-6px_rgba(56,189,248,0.7)]",
        className,
      )}
    >
      <Activity className="h-5 w-5" strokeWidth={2.5} />
    </span>
  );
}

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="หน้าแรก MapTracker"
    >
      <LogoMark />
      {showText && (
        <span className="font-display text-lg font-bold tracking-tight text-fg">
          Map<span className="text-primary">Tracker</span>
        </span>
      )}
    </Link>
  );
}
