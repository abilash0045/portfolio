export type Nearby = { name: string; kind: string; lat: number; lon: number };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Tags checked in order; the first present one becomes the displayed kind. */
const KIND_TAGS = ["tourism", "natural", "historic", "amenity", "leisure"] as const;

export function buildNearbyQuery(
  lat: number,
  lon: number,
  radiusM: number,
): string {
  const at = `around:${radiusM},${lat},${lon}`;
  return `[out:json][timeout:20];
(
  node["tourism"~"^(attraction|viewpoint|museum)$"]["name"](${at});
  node["natural"="beach"]["name"](${at});
  node["historic"]["name"](${at});
  node["amenity"~"^(place_of_worship|cafe|restaurant)$"]["name"](${at});
);
out body 40;`;
}

/**
 * Overpass response into a short list of nearby named things.
 *
 * Every malformed or failed body becomes an empty list. This data decorates a
 * result the user already has, so it is never worth an exception: Overpass
 * fails roughly one call in three and the UI is built to show nothing.
 */
export function normaliseNearby(raw: unknown, limit = 6): Nearby[] {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) return [];

  const seen = new Set<string>();
  const out: Nearby[] = [];

  for (const element of raw.elements) {
    if (out.length >= limit) break;
    if (!isRecord(element) || !isRecord(element.tags)) continue;

    const tags = element.tags;
    const name = typeof tags.name === "string" ? tags.name.trim() : "";
    if (!name || seen.has(name)) continue;

    const kindTag = KIND_TAGS.find((t) => typeof tags[t] === "string");
    if (!kindTag) continue;

    const lat = Number(element.lat);
    const lon = Number(element.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    seen.add(name);
    out.push({ name, kind: String(tags[kindTag]), lat, lon });
  }

  return out;
}
