import { describe, it, expect } from "vitest";
import { parseLatLon, roundKey, USER_AGENT } from "./upstream";

describe("parseLatLon", () => {
  it("accepts valid coordinates", () => {
    expect(parseLatLon(new URLSearchParams("lat=30.5&lon=76.4"))).toEqual({
      lat: 30.5,
      lon: 76.4,
    });
  });

  it.each([
    ["missing lat", "lon=76.4"],
    ["missing lon", "lat=30.5"],
    ["non-numeric", "lat=abc&lon=76.4"],
    ["lat out of range", "lat=91&lon=0"],
    ["lon out of range", "lat=0&lon=181"],
    ["NaN", "lat=NaN&lon=0"],
    ["Infinity", "lat=Infinity&lon=0"],
    ["empty", ""],
  ])("rejects %s", (_label, qs) => {
    expect(parseLatLon(new URLSearchParams(qs))).toBeNull();
  });
});

describe("roundKey", () => {
  it("rounds to the requested precision", () => {
    expect(roundKey(30.51234, 76.44119, 3)).toBe("30.512,76.441");
    expect(roundKey(30.51234, 76.44119, 2)).toBe("30.51,76.44");
  });

  it("gives nearby coordinates the same coarse key", () => {
    expect(roundKey(8.0881, 77.5382, 2)).toBe(roundKey(8.0884, 77.5384, 2));
  });
});

describe("USER_AGENT", () => {
  // Nominatim's policy requires a User-Agent that identifies the application
  // and offers a way to make contact.
  it("identifies the app and links somewhere reachable", () => {
    expect(USER_AGENT).toContain("abilash-portfolio");
    expect(USER_AGENT).toContain("https://");
  });
});
