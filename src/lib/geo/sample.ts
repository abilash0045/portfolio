export type LatLon = { lat: number; lon: number };

/** Mean Earth radius, metres. */
const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Fold any longitude into [-180, 180]. */
export function normaliseLon(lon: number): number {
  const mod = ((((lon + 180) % 360) + 360) % 360) - 180;
  return mod === -180 && lon > 0 ? 180 : mod;
}

/**
 * Move from `origin` along `bearingRad` by `distanceM` across the surface of a
 * sphere.
 *
 * The spherical form is used rather than a flat degrees-per-metre offset
 * because the flat approximation drifts badly at a 500km radius and breaks
 * near the poles, where a degree of longitude is worth almost nothing. It is
 * five lines either way.
 */
export function destinationPoint(
  origin: LatLon,
  bearingRad: number,
  distanceM: number,
): LatLon {
  const lat1 = toRad(origin.lat);
  const lon1 = toRad(origin.lon);
  const delta = distanceM / EARTH_RADIUS_M;

  const sinLat2 =
    Math.sin(lat1) * Math.cos(delta) +
    Math.cos(lat1) * Math.sin(delta) * Math.cos(bearingRad);
  // Clamp guards against a float overshoot past 1 producing NaN from asin.
  const lat2 = Math.asin(Math.min(1, Math.max(-1, sinLat2)));

  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(delta) * Math.cos(lat1),
      Math.cos(delta) - Math.sin(lat1) * sinLat2,
    );

  return { lat: toDeg(lat2), lon: normaliseLon(toDeg(lon2)) };
}

/**
 * Pick a point uniformly over the AREA of the disc of radius `radiusM`
 * centred on `origin`.
 *
 * The square root is load-bearing. An annulus at radius r has area
 * proportional to r, so drawing r linearly puts far too many points near the
 * centre. Taking sqrt of a uniform draw spreads them evenly across the disc.
 * `sample.test.ts` asserts this and will fail if the sqrt is removed.
 *
 * Math.random is sufficient. This is a toy, and crypto randomness here would
 * be a false signal of rigour.
 */
export function sampleInRadius(
  origin: LatLon,
  radiusM: number,
  random: () => number = Math.random,
): LatLon {
  const bearing = 2 * Math.PI * random();
  const distance = radiusM * Math.sqrt(random());
  return destinationPoint(origin, bearing, distance);
}

/** Great-circle distance in metres. */
export function haversineM(a: LatLon, b: LatLon): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}
