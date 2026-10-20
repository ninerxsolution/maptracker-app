import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/app/page-header";
import { fetchQuakes } from "@/lib/usgs";
import { aggregateByCountry } from "@/lib/countries";
import type { TimeWindow } from "@/lib/constants";
import { CountriesView, type CountriesData } from "./countries-view";

export const metadata: Metadata = {
  title: "สถานการณ์รายประเทศ",
  description:
    "สรุปสถานการณ์แผ่นดินไหวแยกตามประเทศและภูมิภาค จากข้อมูล USGS แบบเรียลไทม์",
};

const WINDOWS: TimeWindow[] = ["day", "week", "month"];
const MIN_MAGS = [0, 2.5, 4.5];

async function loadCountries(
  window: TimeWindow,
  minMag: number,
): Promise<CountriesData> {
  try {
    const res = await fetchQuakes(window, minMag);
    return {
      ok: true,
      stats: aggregateByCountry(res.quakes),
      total: res.count,
      generated: res.generated,
    };
  } catch {
    return { ok: false };
  }
}

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; minMag?: string }>;
}) {
  const sp = await searchParams;
  const window = WINDOWS.includes(sp.window as TimeWindow)
    ? (sp.window as TimeWindow)
    : "week";
  const minMag = MIN_MAGS.includes(Number(sp.minMag)) ? Number(sp.minMag) : 2.5;
  const data = await loadCountries(window, minMag);

  return (
    <>
      <SiteHeader />
      <main>
        <Container className="space-y-6 py-8">
          <PageHeader
            title="สถานการณ์รายประเทศ"
            description="สรุปแผ่นดินไหวแยกตามประเทศและภูมิภาค จากข้อมูล USGS แบบเรียลไทม์"
          />
          <CountriesView window={window} minMag={minMag} data={data} />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
