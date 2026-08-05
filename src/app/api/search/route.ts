import { NextResponse } from "next/server";
import { TtlCache, MinIntervalLimiter } from "@/lib/cache";
import { normaliseSearch, type SearchResult } from "@/lib/nominatim";
import { USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

const cache = new TtlCache<SearchResult[]>(60 * 60 * 1000, 200);
const limiter = new MinIntervalLimiter(1_100);

/** Forward geocode, used when geolocation is denied or unavailable. */
export async function GET(request: Request): Promise<NextResponse> {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const key = query.toLowerCase();
  const cached = cache.get(key);
  if (cached) return NextResponse.json({ results: cached });

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=` +
    encodeURIComponent(query);

  try {
    await limiter.acquire();
    const upstream = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) return NextResponse.json({ results: [] });

    const results = normaliseSearch(await upstream.json());
    cache.set(key, results);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
