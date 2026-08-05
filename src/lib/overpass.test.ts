import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normaliseNearby, buildNearbyQuery } from "./overpass";

const fixture = JSON.parse(
  readFileSync(join(process.cwd(), "tests/fixtures/overpass-kanyakumari.json"), "utf8"),
) as unknown;

describe("normaliseNearby", () => {
  it("extracts named places with a kind from a real response", () => {
    const nearby = normaliseNearby(fixture);
    expect(nearby.length).toBeGreaterThan(0);
    for (const item of nearby) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.kind.length).toBeGreaterThan(0);
      expect(Number.isFinite(item.lat)).toBe(true);
      expect(Number.isFinite(item.lon)).toBe(true);
    }
  });

  it("honours the limit", () => {
    expect(normaliseNearby(fixture, 3).length).toBeLessThanOrEqual(3);
  });

  it("drops unnamed elements", () => {
    const result = normaliseNearby({
      elements: [
        { lat: 1, lon: 2, tags: { amenity: "cafe" } },
        { lat: 3, lon: 4, tags: { amenity: "cafe", name: "Tonys Internetcafe" } },
      ],
    });
    expect(result).toEqual([
      { name: "Tonys Internetcafe", kind: "cafe", lat: 3, lon: 4 },
    ]);
  });

  it("deduplicates repeated names", () => {
    const result = normaliseNearby({
      elements: [
        { lat: 1, lon: 2, tags: { amenity: "cafe", name: "Same Place" } },
        { lat: 5, lon: 6, tags: { tourism: "attraction", name: "Same Place" } },
      ],
    });
    expect(result).toHaveLength(1);
  });

  // Overpass fails about one request in three. Every failure shape must
  // become an empty list, never an exception, because this data is optional.
  it.each([
    ["null", null],
    ["a string", "504 Gateway Timeout"],
    ["an object with no elements", { remark: "runtime error" }],
    ["elements that is not an array", { elements: "nope" }],
  ])("returns an empty list for %s", (_label, input) => {
    expect(normaliseNearby(input)).toEqual([]);
  });
});

describe("buildNearbyQuery", () => {
  it("embeds the coordinates and radius", () => {
    const q = buildNearbyQuery(8.0883, 77.5385, 5000);
    expect(q).toContain("around:5000,8.0883,77.5385");
    expect(q).toContain("[out:json]");
  });
});
