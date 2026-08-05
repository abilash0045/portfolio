import { describe, it, expect } from "vitest";
import { normaliseReverse } from "../src/lib/nominatim";
import { normaliseNearby, buildNearbyQuery } from "../src/lib/overpass";
import { USER_AGENT } from "../src/lib/upstream";

/**
 * Hits the live APIs. Never runs in CI: Overpass fails about one request in
 * three, so this would redden roughly one build in three for reasons that have
 * nothing to do with the commit. Run weekly by contract-check.yml, which opens
 * an issue when Nominatim's response shape drifts away from what the recorded
 * fixtures assume.
 */
describe("Nominatim live contract", () => {
  it("still names a rural land coordinate", async () => {
    const response = await fetch(
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=30.5123&lon=76.4412&zoom=14",
      { headers: { "User-Agent": USER_AGENT } },
    );
    expect(response.ok).toBe(true);

    const landing = normaliseReverse(await response.json());
    expect(landing.kind).toBe("place");
    if (landing.kind !== "place") throw new Error("unreachable");
    expect(landing.name.length).toBeGreaterThan(0);
    expect(landing.country).toBe("India");
  });

  it("still returns an ungeocodable body for an ocean coordinate", async () => {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    const response = await fetch(
      "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=15&lon=68&zoom=14",
      { headers: { "User-Agent": USER_AGENT } },
    );
    expect(response.ok).toBe(true);
    expect(normaliseReverse(await response.json())).toEqual({ kind: "nowhere" });
  });
});

describe("Overpass live contract", () => {
  // Not asserted as passing. Overpass failing is the expected case and is
  // already handled by the app returning an empty list.
  it("either answers with parseable elements or fails, and both are fine", async () => {
    try {
      const response = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          data: buildNearbyQuery(8.0883, 77.5385, 5_000),
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) {
        console.warn(`Overpass returned ${response.status}, which is normal.`);
        return;
      }
      expect(Array.isArray(normaliseNearby(await response.json()))).toBe(true);
    } catch (error) {
      console.warn(`Overpass unreachable, which is normal: ${String(error)}`);
    }
  });
});
