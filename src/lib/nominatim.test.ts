import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { normaliseReverse, normaliseSearch } from "./nominatim";

const fixture = (name: string): unknown =>
  JSON.parse(readFileSync(join(process.cwd(), "tests/fixtures", name), "utf8"));

describe("normaliseReverse", () => {
  it("turns a village response into a place", () => {
    const landing = normaliseReverse(fixture("nominatim-village.json"));
    expect(landing.kind).toBe("place");
    if (landing.kind !== "place") throw new Error("unreachable");
    expect(landing.name).toBe("Panjola");
    expect(landing.country).toBe("India");
    expect(landing.category).toBe("village");
    expect(landing.area).toContain("Punjab");
  });

  it("turns an isolated dwelling into a place with that category", () => {
    const landing = normaliseReverse(fixture("nominatim-isolated.json"));
    expect(landing.kind).toBe("place");
    if (landing.kind !== "place") throw new Error("unreachable");
    expect(landing.name).toBe("Jonara");
    expect(landing.category).toBe("isolated_dwelling");
  });

  it("turns Unable to geocode into nowhere", () => {
    expect(normaliseReverse(fixture("nominatim-nowhere.json"))).toEqual({
      kind: "nowhere",
    });
  });

  it("treats a malformed body as nowhere rather than throwing", () => {
    expect(normaliseReverse(null)).toEqual({ kind: "nowhere" });
    expect(normaliseReverse("not json")).toEqual({ kind: "nowhere" });
    expect(normaliseReverse({})).toEqual({ kind: "nowhere" });
  });

  it("falls back to the first segment of display_name when name is empty", () => {
    const landing = normaliseReverse({
      name: "",
      display_name: "Sunset Point, Kanyakumari, Tamil Nadu, India",
      addresstype: "viewpoint",
      address: { state: "Tamil Nadu", country: "India" },
    });
    expect(landing.kind).toBe("place");
    if (landing.kind !== "place") throw new Error("unreachable");
    expect(landing.name).toBe("Sunset Point");
  });

  it("does not repeat the place name inside the area", () => {
    const landing = normaliseReverse({
      name: "Chandigarh",
      addresstype: "city",
      address: { city: "Chandigarh", state: "Chandigarh", country: "India" },
    });
    expect(landing.kind).toBe("place");
    if (landing.kind !== "place") throw new Error("unreachable");
    expect(landing.area).toBe("");
  });
});

describe("normaliseSearch", () => {
  it("maps search hits to name and coordinates", () => {
    const results = normaliseSearch([
      { display_name: "Chennai, Tamil Nadu, India", lat: "13.0836", lon: "80.2700" },
      { display_name: "Chennai Central", lat: "13.0827", lon: "80.2757" },
    ]);
    expect(results).toEqual([
      { name: "Chennai, Tamil Nadu, India", lat: 13.0836, lon: 80.27 },
      { name: "Chennai Central", lat: 13.0827, lon: 80.2757 },
    ]);
  });

  it("drops entries with unparseable coordinates", () => {
    expect(
      normaliseSearch([{ display_name: "Nowhere", lat: "abc", lon: "12" }]),
    ).toEqual([]);
  });

  it("returns an empty list for a non-array body", () => {
    expect(normaliseSearch({ error: "boom" })).toEqual([]);
  });
});
