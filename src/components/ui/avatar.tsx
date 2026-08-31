import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Deterministic accent from the name so avatars are stable + varied.
const ACCENTS = [
  "from-sky-500/30 to-sky-400/10 text-sky-300",
  "from-emerald-500/30 to-emerald-400/10 text-emerald-300",
  "from-amber-500/30 to-amber-400/10 text-amber-300",
  "from-violet-500/30 to-violet-400/10 text-violet-300",
  "from-rose-500/30 to-rose-400/10 text-rose-300",
  "from-teal-500/30 to-teal-400/10 text-teal-300",
];

export function Avatar({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const idx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % ACCENTS.length;
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-semibold ring-1 ring-border",
        ACCENTS[idx],
        "h-9 w-9",
        className,
      )}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
