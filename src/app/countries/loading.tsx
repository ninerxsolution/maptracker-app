import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function CountriesLoading() {
  return (
    <div role="status" aria-label="กำลังโหลดสถานการณ์รายประเทศ">
      <span className="sr-only">กำลังโหลด…</span>
      <header className="border-b border-border/70">
        <Container className="flex h-16 items-center justify-between">
          <Logo />
          <Skeleton className="h-8 w-40" />
        </Container>
      </header>
      <Container className="space-y-6 py-8">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-10 sm:w-72" />
          <Skeleton className="h-10 sm:w-60" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </Container>
    </div>
  );
}
