import { describe, it, expect } from "vitest";
import { TtlCache, MinIntervalLimiter } from "./cache";

describe("TtlCache", () => {
  it("returns a stored value before it expires", () => {
    let t = 1_000;
    const cache = new TtlCache<string>(5_000, 10, () => t);
    cache.set("a", "hello");
    t = 4_000;
    expect(cache.get("a")).toBe("hello");
  });

  it("drops a value once the ttl has passed", () => {
    let t = 1_000;
    const cache = new TtlCache<string>(5_000, 10, () => t);
    cache.set("a", "hello");
    t = 6_001;
    expect(cache.get("a")).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("evicts the oldest entry when over capacity", () => {
    let t = 0;
    const cache = new TtlCache<number>(60_000, 2, () => t);
    cache.set("a", 1);
    t = 1;
    cache.set("b", 2);
    t = 2;
    cache.set("c", 3);
    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
    expect(cache.size).toBe(2);
  });

  it("refreshes expiry when a key is set again", () => {
    let t = 0;
    const cache = new TtlCache<number>(1_000, 10, () => t);
    cache.set("a", 1);
    t = 900;
    cache.set("a", 2);
    t = 1_500;
    expect(cache.get("a")).toBe(2);
  });
});

describe("MinIntervalLimiter", () => {
  it("lets the first caller through without waiting", async () => {
    const waits: number[] = [];
    const limiter = new MinIntervalLimiter(1_000, () => 0, async (ms) => {
      waits.push(ms);
    });
    await limiter.acquire();
    expect(waits).toEqual([]);
  });

  it("spaces sequential callers by the minimum interval", async () => {
    const waits: number[] = [];
    const limiter = new MinIntervalLimiter(1_000, () => 0, async (ms) => {
      waits.push(ms);
    });
    await limiter.acquire();
    await limiter.acquire();
    await limiter.acquire();
    expect(waits).toEqual([1_000, 2_000]);
  });

  it("does not make a caller wait once the interval has already elapsed", async () => {
    const waits: number[] = [];
    let t = 0;
    const limiter = new MinIntervalLimiter(1_000, () => t, async (ms) => {
      waits.push(ms);
    });
    await limiter.acquire();
    t = 5_000;
    await limiter.acquire();
    expect(waits).toEqual([]);
  });
});
