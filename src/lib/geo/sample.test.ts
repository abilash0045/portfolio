import { describe, it, expect } from "vitest";
import {
  sampleInRadius,
  destinationPoint,
  haversineM,
  normaliseLon,
  type LatLon,
} from "./sample";
import { mulberry32 } from "./testing";

const CHANDIGARH: LatLon = { lat: 30.7333, lon: 76.7794 };
const KANYAKUMARI: LatLon = { lat: 8.0883, lon: 77.5385 };

describe("normaliseLon", () => {
  it("leaves in-range longitudes alone", () => {
    expect(normaliseLon(76.7794)).toBeCloseTo(76.7794, 9);
    expect(normaliseLon(-179.5)).toBeCloseTo(-179.5, 9);
  });

  it("wraps longitudes past the antimeridian", () => {
    expect(normaliseLon(181)).toBeCloseTo(-179, 9);
    expect(normaliseLon(-181)).toBeCloseTo(179, 9);
    expect(normaliseLon(540)).toBeCloseTo(180, 9);
  });
});

describe("destinationPoint", () => {
  it("moves due north by the requested distance", () => {
    const north = destinationPoint(CHANDIGARH, 0, 100_000);
    expect(north.lat).toBeGreaterThan(CHANDIGARH.lat);
    expect(haversineM(CHANDIGARH, north)).toBeCloseTo(100_000, 0);
  });

  it("moves due east by the requested distance", () => {
    const east = destinationPoint(CHANDIGARH, Math.PI / 2, 50_000);
    expect(east.lon).toBeGreaterThan(CHANDIGARH.lon);
    expect(haversineM(CHANDIGARH, east)).toBeCloseTo(50_000, 0);
  });
});

describe("sampleInRadius", () => {
  it.each([
    ["Chandigarh", CHANDIGARH, 10_000],
    ["Chandigarh", CHANDIGARH, 500_000],
    ["Kanyakumari", KANYAKUMARI, 250_000],
    ["near the pole", { lat: 89, lon: 0 }, 200_000],
    ["on the equator", { lat: 0, lon: 0 }, 400_000],
  ])("keeps every sample inside the radius (%s, %i m)", (_label, origin, radiusM) => {
    const random = mulberry32(7);
    for (let i = 0; i < 5_000; i += 1) {
      const p = sampleInRadius(origin as LatLon, radiusM as number, random);
      // 1m of slack absorbs float error in the round trip through haversine.
      expect(haversineM(origin as LatLon, p)).toBeLessThanOrEqual((radiusM as number) + 1);
    }
  });

  it("always produces valid coordinates", () => {
    const random = mulberry32(11);
    for (let i = 0; i < 5_000; i += 1) {
      const p = sampleInRadius({ lat: 89.9, lon: 179.9 }, 300_000, random);
      expect(Number.isFinite(p.lat)).toBe(true);
      expect(Number.isFinite(p.lon)).toBe(true);
      expect(p.lat).toBeGreaterThanOrEqual(-90);
      expect(p.lat).toBeLessThanOrEqual(90);
      expect(p.lon).toBeGreaterThanOrEqual(-180);
      expect(p.lon).toBeLessThanOrEqual(180);
    }
  });

  it("crosses the antimeridian without producing out-of-range longitude", () => {
    const random = mulberry32(3);
    let sawWest = false;
    let sawEast = false;
    for (let i = 0; i < 5_000; i += 1) {
      const p = sampleInRadius({ lat: 0, lon: 179.9 }, 400_000, random);
      expect(p.lon).toBeGreaterThanOrEqual(-180);
      expect(p.lon).toBeLessThanOrEqual(180);
      if (p.lon < 0) sawWest = true;
      if (p.lon > 0) sawEast = true;
    }
    expect(sawWest && sawEast).toBe(true);
  });

  // This is the test that protects the square root. Without it, sampling
  // r = R * random() crowds the centre: the innermost tenth of the radius
  // would hold ~10% of samples instead of the correct 1%.
  it("distributes samples uniformly over area, not over radius", () => {
    const random = mulberry32(42);
    const origin = CHANDIGARH;
    const radiusM = 200_000;
    const bins = 10;
    const samples = 100_000;
    const counts = new Array<number>(bins).fill(0);

    for (let i = 0; i < samples; i += 1) {
      const p = sampleInRadius(origin, radiusM, random);
      const ratio = haversineM(origin, p) / radiusM;
      const bin = Math.min(bins - 1, Math.floor(ratio * bins));
      counts[bin] += 1;
    }

    for (let i = 0; i < bins; i += 1) {
      // Area of the i-th annulus as a share of the disc: ((i+1)^2 - i^2) / bins^2
      const expectedShare = (2 * i + 1) / (bins * bins);
      const actualShare = counts[i] / samples;
      expect(actualShare).toBeGreaterThan(expectedShare * 0.85);
      expect(actualShare).toBeLessThan(expectedShare * 1.15);
    }
  });
});
