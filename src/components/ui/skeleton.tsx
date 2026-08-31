import { cn } from "@/lib/utils";

/** Shimmering placeholder block. Use while data loads. */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-[shimmer_1.6s_ease-in-out_infinite] rounded-lg bg-surface-3/80",
        className,
      )}
      {...props}
    />
  );
}
