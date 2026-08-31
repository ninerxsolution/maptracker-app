import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function BookmarksLoading() {
  return (
    <Container className="space-y-6 py-6">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44" />
        ))}
      </div>
    </Container>
  );
}
