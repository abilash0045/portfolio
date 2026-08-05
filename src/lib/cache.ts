/**
 * Small in-process TTL cache with insertion-order eviction.
 *
 * On Vercel's serverless model this is per-instance, not global. That is fine
 * for what it does here: place names do not change, so a per-instance hit
 * still removes most upstream calls.
 */
export class TtlCache<V> {
  private readonly store = new Map<string, { value: V; expiresAt: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = 500,
    private readonly now: () => number = Date.now,
  ) {}

  get size(): number {
    return this.store.size;
  }

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= this.now()) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: string, value: V): void {
    // Delete first so a re-set moves the key to the end of the insertion order.
    this.store.delete(key);
    this.store.set(key, { value, expiresAt: this.now() + this.ttlMs });

    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next();
      if (oldest.done) break;
      this.store.delete(oldest.value);
    }
  }
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Serialises callers so no two proceed closer together than `minIntervalMs`.
 *
 * Nominatim's usage policy is one request per second, absolute. Callers wait
 * rather than fail, because a slow throw is better than a broken one.
 *
 * Per-instance, like the cache. The cache is the real defence against the
 * shared limit; this is the backstop.
 */
export class MinIntervalLimiter {
  private nextAvailable = 0;

  constructor(
    private readonly minIntervalMs: number,
    private readonly now: () => number = Date.now,
    private readonly sleep: (ms: number) => Promise<void> = defaultSleep,
  ) {}

  async acquire(): Promise<void> {
    const t = this.now();
    const slot = Math.max(t, this.nextAvailable);
    this.nextAvailable = slot + this.minIntervalMs;
    const wait = slot - t;
    if (wait > 0) await this.sleep(wait);
  }
}
