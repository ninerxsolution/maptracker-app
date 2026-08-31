import { NextResponse, type NextRequest } from "next/server";
import { fetchQuakes } from "@/lib/usgs";
import { USGS_FEEDS, type TimeWindow } from "@/lib/constants";

// Proxy + cache the USGS feed so the client never talks to USGS directly.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const windowParam = sp.get("window") ?? "day";
  const minMag = Number(sp.get("minMag") ?? "0");

  if (!(windowParam in USGS_FEEDS)) {
    return NextResponse.json(
      { error: `Invalid window. Use one of: ${Object.keys(USGS_FEEDS).join(", ")}` },
      { status: 400 },
    );
  }

  try {
    const data = await fetchQuakes(
      windowParam as TimeWindow,
      Number.isFinite(minMag) ? minMag : 0,
    );
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load data from USGS. Please try again shortly." },
      { status: 502 },
    );
  }
}
