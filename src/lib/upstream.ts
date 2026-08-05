/**
 * Identifies this app to Nominatim, whose usage policy requires a
 * User-Agent naming the application with a way to make contact.
 */
export const USER_AGENT =
  "abilash-portfolio/1.0 (+https://github.com/abilash0045/portfolio)";

export function parseLatLon(
  params: URLSearchParams,
): { lat: number; lon: number } | null {
  const rawLat = params.get("lat");
  const rawLon = params.get("lon");
  if (rawLat === null || rawLon === null) return null;

  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return { lat, lon };
}

/** Cache key at a chosen precision. 3dp is about 110m, 2dp about 1.1km. */
export function roundKey(lat: number, lon: number, dp: number): string {
  return `${lat.toFixed(dp)},${lon.toFixed(dp)}`;
}
