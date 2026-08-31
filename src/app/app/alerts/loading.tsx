import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlertsLoading() {
  return (
    <Container className="max-w-3xl space-y-6 py-6" role="status" aria-label="Loading alerts">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-64 w-full" />
    </Container>
  );
}
