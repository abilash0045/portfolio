import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const call = (q: string) =>
  GET(new Request(`http://localhost/api/search?q=${encodeURIComponent(q)}`));

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/search", () => {
  it("rejects a query too short to mean anything", async () => {
    const response = await call("a");
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "bad_request" });
  });

  // The distinction this route exists to make. Both of the paths below used
  // to answer `{ results: [] }`, which is indistinguishable from Nominatim
  // saying no such place, so the UI had nothing true it could tell anyone.
  it("marks an upstream failure as an error, not as no results", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("upstream is unwell", { status: 503 })),
    );

    const body = await (await call("somewhere upstream is down")).json();
    expect(body).toEqual({ results: [], error: "upstream" });
  });

  it("marks a thrown request as an error too", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network");
      }),
    );

    const body = await (await call("somewhere unreachable")).json();
    expect(body).toEqual({ results: [], error: "upstream" });
  });

  it("reports a genuine no-match without an error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json([])),
    );

    const body = await (await call("qqqzzz no such place")).json();
    expect(body).toEqual({ results: [] });
    expect(body).not.toHaveProperty("error");
  });
});
