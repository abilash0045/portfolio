import { NextResponse } from "next/server";
import { TtlCache, MinIntervalLimiter } from "@/lib/cache";
import { normaliseReverse, type Landing } from "@/lib/nominatim";
import { parseLatLon, roundKey, USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

// Place names do not change, so the TTL is long and the cache does most of
// the work of staying inside Nominatim's shared limit.
const cache = new TtlCache<Landing>(24 * 60 * 60 * 1000, 1_000);
const limiter = new MinIntervalLimiter(1_100);

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const point = parseLatLon(params);
  if (!point) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const key = roundKey(point.lat, point.lon, 3);
  const cached = cache.get(key);
  if (cached) return NextResponse.json(cached);

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${point.lat}&lon=${point.lon}&zoom=14`;

  try {
    await limiter.acquire();
    const upstream = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const landing = normaliseReverse(await upstream.json());
    cache.set(key, landing);
    return NextResponse.json(landing);
  } catch {
    // A network failure is not an empty ocean. The UI is told they differ,
    // because telling someone their dart hit open water when the service was
    // down would be a lie.
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
