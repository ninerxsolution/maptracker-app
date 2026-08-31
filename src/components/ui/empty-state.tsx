import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center",
        className,
      )}
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-faint">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <p className="font-medium text-fg">{title}</p>
        {body && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>}
      </div>
      {action}
    </div>
  );
}
