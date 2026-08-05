import { NextResponse } from "next/server";
import { TtlCache } from "@/lib/cache";
import { normaliseNearby, buildNearbyQuery, type Nearby } from "@/lib/overpass";
import { parseLatLon, roundKey, USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

// Coarse key: anything within about a kilometre shares a cached answer.
const cache = new TtlCache<Nearby[]>(7 * 24 * 60 * 60 * 1000, 500);

/**
 * Enrichment only. This endpoint always answers 200 with a list, possibly
 * empty, because Overpass fails roughly one request in three and the page is
 * built to show nothing rather than an error the user was never promised.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const point = parseLatLon(params);
  if (!point) return NextResponse.json({ nearby: [] });

  const key = roundKey(point.lat, point.lon, 2);
  const cached = cache.get(key);
  if (cached) return NextResponse.json({ nearby: cached });

  try {
    const upstream = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        data: buildNearbyQuery(point.lat, point.lon, 5_000),
      }),
      signal: AbortSignal.timeout(9_000),
    });

    if (!upstream.ok) return NextResponse.json({ nearby: [] });

    const nearby = normaliseNearby(await upstream.json());
    // Only a real answer is cached. Caching an empty list after a 504 would
    // poison the area for a week.
    if (nearby.length > 0) cache.set(key, nearby);
    return NextResponse.json({ nearby });
  } catch {
    return NextResponse.json({ nearby: [] });
  }
}
