import { magnitudeColor, formatMagnitude } from "@/lib/magnitude";
import { cn } from "@/lib/utils";

export function MagBadge({
  mag,
  size = "md",
  className,
}: {
  mag: number | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = magnitudeColor(mag);
  const sizes = {
    sm: "text-xs px-1.5 py-0.5 min-w-[2.75rem]",
    md: "text-sm px-2 py-0.5 min-w-[3.25rem]",
    lg: "text-lg px-3 py-1 min-w-[4rem]",
  }[size];

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center gap-0.5 rounded-lg border font-semibold tabular",
        sizes,
        className,
      )}
      style={{
        color,
        borderColor: `${color}55`,
        backgroundColor: `${color}1a`,
      }}
    >
      <span className="opacity-60">M</span>
      {formatMagnitude(mag)}
    </span>
  );
}
