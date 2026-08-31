import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function ZonesLoading() {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      <div className="shrink-0 space-y-3 border-b border-border p-4 lg:w-[380px] lg:border-b-0 lg:border-r">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
      <div className="grid min-h-[50vh] flex-1 place-items-center bg-[#0b0e14] lg:min-h-0">
        <Spinner className="h-6 w-6 text-primary" />
      </div>
    </div>
  );
}
