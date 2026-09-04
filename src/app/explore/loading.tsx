import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Logo } from "@/components/brand/logo";

export default function ExploreLoading() {
  return (
    <div className="flex h-dvh flex-col" role="status" aria-label="Loading map">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/70 px-4 sm:px-6">
        <Logo />
        <Skeleton className="h-8 w-40" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex flex-col gap-3 border-b border-border p-4 lg:w-[384px] lg:border-b-0 lg:border-r">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <div className="mt-2 space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </aside>

        <div className="grid min-h-[55vh] flex-1 place-items-center bg-map-bg lg:min-h-0">
          <div className="flex flex-col items-center gap-3 text-muted">
            <Spinner className="h-6 w-6 text-primary" />
            <p className="text-sm">Loading live earthquake map…</p>
          </div>
        </div>
      </div>
    </div>
  );
}
