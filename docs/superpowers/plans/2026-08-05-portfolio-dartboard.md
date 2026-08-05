# Portfolio + Dartboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a personal portfolio at `/` and a working dart-throwing wall map at `/dartboard`, deployed on Vercel with full CI and workable from a phone via Claude Code cloud sessions.

**Architecture:** Next.js App Router. The dart throw samples a coordinate locally (pure function, no network), then blocks on one fast Nominatim reverse-geocode through a caching API route. Overpass enrichment runs after the result is already on screen and is allowed to fail silently, because it fails roughly one call in three. Leaflet renders raster tiles filtered to look like aged paper.

**Tech Stack:** Next.js 16.3.0, TypeScript, Leaflet 1.9.4 (raw, no react-leaflet), Vitest 4.1.10, Playwright 1.62.1. No CSS framework, no component library.

## Global Constraints

- **Nothing mocked in the application.** Every feature calls real APIs and handles real failures. Test fixtures are recorded from real calls and labelled with the date recorded; that is the only place recorded data may appear.
- **Public and indexed.** No "open to work", no compensation figures, no relocation intent anywhere on the site.
- **Employer detail capped at resume level.** Numbers, tech and narrative are in. Internal service names, client names, and real architecture diagrams of Whilter's systems are out.
- **Exact claim wording** (these are load-bearing and must not drift): 25,000+ daily video renders; render success 60% → 98%, root-caused to **MOV atom corruption from concurrent EFS reads/writes**, fixed by staging media on pod-local ephemeral disk — **not** attributable to KEDA; ~40% monthly cloud spend cut as **two independent wins**, a segment-level Redis cache at ~80% hit rate (~30%) and a Pub/Sub queue-depth Cloud Run autoscaler replacing KEDA-on-GKE (~10%); config playground on the Visitor pattern, approval cycle 3 days → 1 day; S3 → EFS migration, 2x throughput.
- **Attribution is mandatory, not fine print.** OpenStreetMap contributors and CARTO credited on the map, per ODbL.
- **`~/career-plan` never enters this repo.** Private job-search material.
- **Voice:** the repo `CLAUDE.md` written in Task 1 governs all prose. No em-dashes in anything a human reads. No banned AI lexicon. Minimal bold.
- **Node 22** everywhere: CI, and the `.nvmrc` written in Task 1.
- `prefers-reduced-motion` is respected by every animation.

---

## File Structure

| Path | Responsibility |
|---|---|
| `CLAUDE.md` | Repo-level rules that travel to cloud sessions |
| `.nvmrc`, `.claude/settings.json` | Node pin; SessionStart hook installing deps in cloud sessions |
| `src/lib/geo/sample.ts` | Pure dart sampler and spherical geometry. No I/O. |
| `src/lib/geo/testing.ts` | Seeded RNG used by tests and e2e determinism |
| `src/lib/nominatim.ts` | Nominatim response → `Landing`. Pure. |
| `src/lib/overpass.ts` | Overpass response → `Nearby[]`. Pure. |
| `src/lib/cache.ts` | TTL cache + minimum-interval rate limiter. Pure, injectable clock. |
| `src/app/api/reverse/route.ts` | Blocking reverse geocode, cached, rate-limited |
| `src/app/api/nearby/route.ts` | Non-blocking enrichment, cached, fails to `[]` |
| `src/app/api/search/route.ts` | Forward geocode for the geolocation-denied fallback |
| `src/components/dartboard/useDartboard.ts` | Phase state machine, geolocation, fetches |
| `src/components/dartboard/WallMap.tsx` | Leaflet lifecycle, tiles, radius circle, pin |
| `src/components/dartboard/ThrowControls.tsx` | Radius slider, throw button, location fallback |
| `src/components/dartboard/LandingCard.tsx` | Result card, including the nowhere case |
| `src/components/dartboard/NearbyStrip.tsx` | Overpass enrichment strip |
| `src/content/case-studies.ts` | Case study copy as typed data |
| `src/app/page.tsx`, `src/components/site/*` | Portfolio home |
| `tests/fixtures/*.json` | Responses recorded from real calls on 2026-08-05 |
| `contract/live-api.test.ts` | Hits live APIs, run weekly, never in CI |
| `.github/workflows/ci.yml`, `contract-check.yml` | CI and upstream drift detection |

---

### Task 1: Scaffold, repo config, CI, and a green build on GitHub

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (via create-next-app)
- Create: `.nvmrc`, `CLAUDE.md`, `.claude/settings.json`, `scripts/install_pkgs.sh`, `vitest.config.ts`, `.github/workflows/ci.yml`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: nothing
- Produces: npm scripts `typecheck`, `lint`, `test:unit`, `test:e2e`, `test:contract`, `build`, `dev`, `start`. All later tasks rely on these names.

- [ ] **Step 1: Scaffold Next.js into the existing repo**

The repo already exists at `~/portfolio` with `.gitignore`, `NOTES.md`, `docs/`. Scaffold in place:

```bash
cd ~/portfolio
npx create-next-app@latest . --typescript --eslint --app --src-dir --no-tailwind --import-alias "@/*" --use-npm --yes
```

If it refuses because the directory is not empty, answer yes to proceed; it preserves unrelated files. Verify `docs/DESIGN.md` and `NOTES.md` still exist afterwards.

- [ ] **Step 2: Pin Node and add dev dependencies**

```bash
cd ~/portfolio
echo "22" > .nvmrc
npm i leaflet@1.9.4
npm i -D @types/leaflet vitest @vitest/coverage-v8 @playwright/test jsdom
```

- [ ] **Step 3: Add npm scripts**

Replace the `"scripts"` block in `package.json` with:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run --config vitest.config.ts",
    "test:contract": "vitest run --config vitest.contract.config.ts",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 4: Configure Vitest for unit tests only**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
  },
});
```

Create `vitest.contract.config.ts` — separate so live-API tests never run in CI:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    include: ["contract/**/*.test.ts"],
    environment: "node",
    testTimeout: 30_000,
  },
});
```

- [ ] **Step 5: Write the repo CLAUDE.md**

This file is the reason mobile sessions behave like desk sessions. Create `CLAUDE.md`:

```markdown
# Portfolio — working rules

Design and rationale: `docs/DESIGN.md`. Running decisions: `NOTES.md`.
Read both before changing behaviour. Update `NOTES.md` when a decision changes.

## Voice

Everything written here is read by a human, including commit messages and UI copy.

- Plain prose, contractions, short paragraphs. Answer first, no warm-up, no wrap-up.
- No em-dashes. Use commas, colons, or a new sentence.
- Banned: delve, leverage, seamless, robust, comprehensive, crucial, pivotal, elevate,
  empower, foster, unlock, unleash, harness, streamline, supercharge, game-changer,
  cutting-edge, next-generation, journey, landscape, tapestry, testament, realm, myriad,
  plethora, vibrant.
- Never open with "Great question", "Certainly", "Let's dive in". Never close with
  "I hope this helps" or a recap.
- Never the contrast tic: "It's not just X, it's Y".
- No bullet lists under four parallel items. No "**Bold term:** explanation" trains.
- Buttons say the verb. Errors say what broke and what to do next, with no exclamation marks.

## Code

Walk this ladder and stop at the first rung that applies: does it need to exist; is it
already in the codebase; can the standard library or the platform do it; is there an
installed dependency; can it be one line. Only then write new code.

This trims over-building, not diligence. Input validation, error handling, and
attribution are never cut.

## Project constraints

- Nothing in the application is mocked. It calls real APIs and handles real failures.
  Recorded fixtures live only in `tests/fixtures/` and are labelled with their capture date.
- Overpass fails roughly one call in three. It must never block a user action.
- Employer claims are fixed wording. Do not reword the numbers in `src/content/case-studies.ts`
  without checking `docs/DESIGN.md` first. The 60→98% reliability win is the EFS/MOV-atom
  root cause, never KEDA. The ~30% and ~10% cost wins are independent and must not merge
  into one ~40% story.
- No "open to work", compensation figures, or relocation intent anywhere on the site.
- OpenStreetMap and CARTO attribution stays visible on the map.
- Respect `prefers-reduced-motion` in every animation.
```

- [ ] **Step 6: Add the SessionStart hook so cloud sessions install dependencies**

Create `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume",
        "hooks": [
          {
            "type": "command",
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/scripts/install_pkgs.sh"
          }
        ]
      }
    ]
  }
}
```

Create `scripts/install_pkgs.sh`:

```bash
#!/bin/bash
# Installs dependencies in Claude Code cloud sessions only.
# CLAUDE_CODE_REMOTE is "true" on the cloud VM and never true locally,
# so this is a no-op on the laptop where node_modules already exists.

if [ "$CLAUDE_CODE_REMOTE" != "true" ]; then
  exit 0
fi

if [ -d node_modules ]; then
  exit 0
fi

npm ci || npm install
exit 0
```

```bash
chmod +x scripts/install_pkgs.sh
```

- [ ] **Step 7: Write the CI workflow**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run build
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

Note there is no live-API step. `test:contract` is deliberately excluded; Overpass fails about one call in three and would redden roughly one build in three for reasons unrelated to the commit.

- [ ] **Step 8: Verify the whole pipeline locally**

```bash
cd ~/portfolio && npm run typecheck && npm run lint && npm run build
```

Expected: all three exit 0. `npm run test:unit` will report no test files, which is fine at this stage.

- [ ] **Step 9: Create the GitHub repo and push**

```bash
cd ~/portfolio
gh repo create portfolio --public --source=. --remote=origin --description "Portfolio and a wall map you throw darts at"
git add -A
git commit -m "Scaffold Next.js, CI, and repo rules that travel to cloud sessions"
git push -u origin main
```

- [ ] **Step 10: Confirm CI is green on GitHub**

```bash
cd ~/portfolio && sleep 45 && gh run list --limit 3
```

Expected: the CI run shows `completed  success`. If it failed, read it with `gh run view --log-failed` and fix before continuing. Do not proceed on a red build.

---

### Task 2: The dart sampler

**Files:**
- Create: `src/lib/geo/sample.ts`, `src/lib/geo/sample.test.ts`, `src/lib/geo/testing.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type LatLon = { lat: number; lon: number }`
  - `sampleInRadius(origin: LatLon, radiusM: number, random?: () => number): LatLon`
  - `destinationPoint(origin: LatLon, bearingRad: number, distanceM: number): LatLon`
  - `haversineM(a: LatLon, b: LatLon): number`
  - `normaliseLon(lon: number): number`
  - `mulberry32(seed: number): () => number` from `src/lib/geo/testing.ts`

- [ ] **Step 1: Write the seeded RNG helper**

Tests need determinism. Create `src/lib/geo/testing.ts`:

```ts
/**
 * Small deterministic PRNG. Used by tests and by the e2e suite so a "random"
 * throw can be asserted against. Production uses Math.random.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/geo/sample.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL, cannot resolve `./sample`.

- [ ] **Step 4: Implement the sampler**

Create `src/lib/geo/sample.ts`:

```ts
export type LatLon = { lat: number; lon: number };

/** Mean Earth radius, metres. */
const EARTH_RADIUS_M = 6_371_000;

const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** Fold any longitude into [-180, 180]. */
export function normaliseLon(lon: number): number {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd ~/portfolio && npm run test:unit`
Expected: PASS, all cases in `sample.test.ts`.

- [ ] **Step 6: Prove the uniformity test actually catches the bug**

This is the point of the test, so verify it works. Temporarily change `sampleInRadius` to `const distance = radiusM * random();` and re-run.

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL on "distributes samples uniformly over area, not over radius". Then restore the `Math.sqrt` and confirm PASS again. Do not commit the broken version.

- [ ] **Step 7: Commit**

```bash
cd ~/portfolio
git add src/lib/geo
git commit -m "Dart sampler: uniform over area, spherical projection"
```

---

### Task 3: TTL cache and rate limiter

**Files:**
- Create: `src/lib/cache.ts`, `src/lib/cache.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `class TtlCache<V>` with `constructor(ttlMs: number, maxEntries?: number, now?: () => number)`, `get(key: string): V | undefined`, `set(key: string, value: V): void`, `readonly size: number`
  - `class MinIntervalLimiter` with `constructor(minIntervalMs: number, now?: () => number, sleep?: (ms: number) => Promise<void>)` and `acquire(): Promise<void>`

- [ ] **Step 1: Write the failing tests**

Create `src/lib/cache.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL, cannot resolve `./cache`.

- [ ] **Step 3: Implement the cache and limiter**

Create `src/lib/cache.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd ~/portfolio && npm run test:unit`
Expected: PASS, both suites.

- [ ] **Step 5: Commit**

```bash
cd ~/portfolio
git add src/lib/cache.ts src/lib/cache.test.ts
git commit -m "TTL cache and minimum-interval limiter"
```

---

### Task 4: Nominatim normaliser and recorded fixtures

**Files:**
- Create: `tests/fixtures/nominatim-village.json`, `tests/fixtures/nominatim-nowhere.json`, `tests/fixtures/nominatim-isolated.json`
- Create: `src/lib/nominatim.ts`, `src/lib/nominatim.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Landing = { kind: "place"; name: string; area: string; country: string; category: string } | { kind: "nowhere" }`
  - `normaliseReverse(raw: unknown): Landing`
  - `type SearchResult = { name: string; lat: number; lon: number }`
  - `normaliseSearch(raw: unknown): SearchResult[]`

- [ ] **Step 1: Record the fixtures from real calls**

These are captured verbatim from live Nominatim, not written by hand.

```bash
cd ~/portfolio && mkdir -p tests/fixtures
UA="abilash-portfolio/1.0 (+https://github.com/abilash0045/portfolio)"
curl -s "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=30.5123&lon=76.4412&zoom=14" -H "User-Agent: $UA" > tests/fixtures/nominatim-village.json
sleep 1
curl -s "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=15.0&lon=68.0&zoom=14" -H "User-Agent: $UA" > tests/fixtures/nominatim-nowhere.json
sleep 1
curl -s "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=27.2&lon=71.0&zoom=14" -H "User-Agent: $UA" > tests/fixtures/nominatim-isolated.json
head -c 200 tests/fixtures/nominatim-village.json; echo; cat tests/fixtures/nominatim-nowhere.json
```

Expected: the village file contains `"name": "Panjola"`, the nowhere file is exactly `{"error":"Unable to geocode"}`, the isolated file contains `"name": "Jonara"` with `"addresstype": "isolated_dwelling"`. If upstream data has changed and the names differ, use whatever came back and adjust the expected values in Step 2 to match the recorded files. The fixture is the record of what the API actually returns.

Create `tests/fixtures/README.md`:

```markdown
# Recorded fixtures

Captured verbatim from live APIs on 2026-08-05. Not hand-written, not edited.

These exist so CI is deterministic. Overpass fails roughly one request in three,
so a test suite calling it live would fail about one build in three for reasons
that have nothing to do with the commit.

Drift against the live APIs is caught by `contract/live-api.test.ts`, run weekly
by `.github/workflows/contract-check.yml`.
```

- [ ] **Step 2: Write the failing tests**

Create `src/lib/nominatim.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL, cannot resolve `./nominatim`.

- [ ] **Step 4: Implement the normaliser**

Create `src/lib/nominatim.ts`:

```ts
export type Landing =
  | {
      kind: "place";
      name: string;
      area: string;
      country: string;
      category: string;
    }
  | { kind: "nowhere" };

export type SearchResult = { name: string; lat: number; lon: number };

type Address = Partial<
  Record<
    | "city"
    | "town"
    | "village"
    | "hamlet"
    | "suburb"
    | "county"
    | "state_district"
    | "state"
    | "country",
    string
  >
>;

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

const str = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

/**
 * Nominatim reverse response into the one shape the UI understands.
 *
 * `nowhere` carries no reason on purpose. Nominatim returns the same
 * "Unable to geocode" body for an ocean coordinate and for unmapped land,
 * and there is no field that separates them, so claiming to know which
 * would be a guess dressed as a fact.
 */
export function normaliseReverse(raw: unknown): Landing {
  if (!isRecord(raw)) return { kind: "nowhere" };
  if (typeof raw.error === "string") return { kind: "nowhere" };

  const address: Address = isRecord(raw.address) ? (raw.address as Address) : {};
  const displayName = str(raw.display_name);

  const name = str(raw.name) || displayName.split(",")[0]?.trim() || "";
  if (!name) return { kind: "nowhere" };

  const country = str(address.country);
  const category = str(raw.addresstype) || str(raw.type) || "place";

  const areaParts = [
    address.city ?? address.town ?? address.suburb,
    address.state_district ?? address.county,
    address.state,
  ]
    .map(str)
    .filter((part) => part.length > 0 && part !== name);

  const area = [...new Set(areaParts)].join(", ");

  return { kind: "place", name, area, country, category };
}

/** Nominatim forward-search response into pickable locations. */
export function normaliseSearch(raw: unknown): SearchResult[] {
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((entry): SearchResult[] => {
    if (!isRecord(entry)) return [];
    const name = str(entry.display_name);
    const lat = Number(entry.lat);
    const lon = Number(entry.lon);
    if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return [];
    return [{ name, lat, lon }];
  });
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd ~/portfolio && npm run test:unit`
Expected: PASS. If the village fixture came back with a different place name than Panjola, update the expected values in the test to match the recorded file rather than editing the fixture.

- [ ] **Step 6: Commit**

```bash
cd ~/portfolio
git add src/lib/nominatim.ts src/lib/nominatim.test.ts tests/fixtures
git commit -m "Nominatim normaliser, with responses recorded from real calls"
```

---

### Task 5: Overpass normaliser

**Files:**
- Create: `tests/fixtures/overpass-kanyakumari.json`
- Create: `src/lib/overpass.ts`, `src/lib/overpass.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Nearby = { name: string; kind: string; lat: number; lon: number }`
  - `normaliseNearby(raw: unknown, limit?: number): Nearby[]`
  - `buildNearbyQuery(lat: number, lon: number, radiusM: number): string`

- [ ] **Step 1: Record the fixture**

Overpass fails often, so retry until one call succeeds.

```bash
cd ~/portfolio
for attempt in 1 2 3 4 5; do
  curl -s -m 90 -X POST "https://overpass-api.de/api/interpreter" \
    -H "User-Agent: abilash-portfolio/1.0 (+https://github.com/abilash0045/portfolio)" \
    --data-urlencode 'data=[out:json][timeout:60];
(
  node["tourism"~"^(attraction|viewpoint|museum)$"]["name"](around:5000,8.0883,77.5385);
  node["natural"="beach"]["name"](around:5000,8.0883,77.5385);
  node["amenity"~"^(place_of_worship|cafe|restaurant)$"]["name"](around:5000,8.0883,77.5385);
);
out body 30;' > tests/fixtures/overpass-kanyakumari.json
  if grep -q '"elements"' tests/fixtures/overpass-kanyakumari.json; then echo "captured on attempt $attempt"; break; fi
  echo "attempt $attempt failed, retrying"; sleep 5
done
python3 -c "import json;d=json.load(open('tests/fixtures/overpass-kanyakumari.json'));print('elements:',len(d['elements']))"
```

Expected: a non-zero element count. This retry loop is itself a demonstration of why Overpass is off the critical path.

- [ ] **Step 2: Write the failing tests**

Create `src/lib/overpass.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL, cannot resolve `./overpass`.

- [ ] **Step 4: Implement the normaliser**

Create `src/lib/overpass.ts`:

```ts
export type Nearby = { name: string; kind: string; lat: number; lon: number };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null;

/** Tags checked in order; the first present one becomes the displayed kind. */
const KIND_TAGS = ["tourism", "natural", "historic", "amenity", "leisure"] as const;

export function buildNearbyQuery(
  lat: number,
  lon: number,
  radiusM: number,
): string {
  const at = `around:${radiusM},${lat},${lon}`;
  return `[out:json][timeout:20];
(
  node["tourism"~"^(attraction|viewpoint|museum)$"]["name"](${at});
  node["natural"="beach"]["name"](${at});
  node["historic"]["name"](${at});
  node["amenity"~"^(place_of_worship|cafe|restaurant)$"]["name"](${at});
);
out body 40;`;
}

/**
 * Overpass response into a short list of nearby named things.
 *
 * Every malformed or failed body becomes an empty list. This data decorates a
 * result the user already has, so it is never worth an exception: Overpass
 * fails roughly one call in three and the UI is built to show nothing.
 */
export function normaliseNearby(raw: unknown, limit = 6): Nearby[] {
  if (!isRecord(raw) || !Array.isArray(raw.elements)) return [];

  const seen = new Set<string>();
  const out: Nearby[] = [];

  for (const element of raw.elements) {
    if (out.length >= limit) break;
    if (!isRecord(element) || !isRecord(element.tags)) continue;

    const tags = element.tags;
    const name = typeof tags.name === "string" ? tags.name.trim() : "";
    if (!name || seen.has(name)) continue;

    const kindTag = KIND_TAGS.find((t) => typeof tags[t] === "string");
    if (!kindTag) continue;

    const lat = Number(element.lat);
    const lon = Number(element.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    seen.add(name);
    out.push({ name, kind: String(tags[kindTag]), lat, lon });
  }

  return out;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd ~/portfolio && npm run test:unit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd ~/portfolio
git add src/lib/overpass.ts src/lib/overpass.test.ts tests/fixtures/overpass-kanyakumari.json
git commit -m "Overpass normaliser: every failure shape becomes an empty list"
```

---

### Task 6: The three API routes

**Files:**
- Create: `src/lib/upstream.ts`, `src/lib/upstream.test.ts`
- Create: `src/app/api/reverse/route.ts`, `src/app/api/nearby/route.ts`, `src/app/api/search/route.ts`

**Interfaces:**
- Consumes: `TtlCache`, `MinIntervalLimiter` (Task 3); `normaliseReverse`, `normaliseSearch`, `Landing`, `SearchResult` (Task 4); `normaliseNearby`, `buildNearbyQuery`, `Nearby` (Task 5)
- Produces:
  - `parseLatLon(params: URLSearchParams): { lat: number; lon: number } | null` from `src/lib/upstream.ts`
  - `roundKey(lat: number, lon: number, dp: number): string` from `src/lib/upstream.ts`
  - `USER_AGENT: string` from `src/lib/upstream.ts`
  - `GET /api/reverse?lat&lon` → `Landing` (200) or `{ error: "bad_request" }` (400) or `{ error: "upstream" }` (502)
  - `GET /api/nearby?lat&lon` → `{ nearby: Nearby[] }`, always 200
  - `GET /api/search?q` → `{ results: SearchResult[] }` (200) or `{ error: "bad_request" }` (400)

- [ ] **Step 1: Write the failing tests for the shared helpers**

Create `src/lib/upstream.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd ~/portfolio && npm run test:unit`
Expected: FAIL, cannot resolve `./upstream`.

- [ ] **Step 3: Implement the shared helpers**

Create `src/lib/upstream.ts`:

```ts
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd ~/portfolio && npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Implement the reverse route**

Create `src/app/api/reverse/route.ts`:

```ts
import { NextResponse } from "next/server";
import { TtlCache, MinIntervalLimiter } from "@/lib/cache";
import { normaliseReverse, type Landing } from "@/lib/nominatim";
import { parseLatLon, roundKey, USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

// Place names do not change, so the TTL is long and the cache does most of
// the work of staying inside Nominatim's shared limit.
const cache = new TtlCache<Landing>(24 * 60 * 60 * 1000, 1_000);
const limiter = new MinIntervalLimiter(1_100);

export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const point = parseLatLon(params);
  if (!point) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const key = roundKey(point.lat, point.lon, 3);
  const cached = cache.get(key);
  if (cached) return NextResponse.json(cached);

  const url =
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
    `&lat=${point.lat}&lon=${point.lon}&zoom=14`;

  try {
    await limiter.acquire();
    const upstream = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream" }, { status: 502 });
    }

    const landing = normaliseReverse(await upstream.json());
    cache.set(key, landing);
    return NextResponse.json(landing);
  } catch {
    // A network failure is not an empty ocean. The UI is told they differ,
    // because telling someone their dart hit open water when the service was
    // down would be a lie.
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
```

- [ ] **Step 6: Implement the nearby route**

Create `src/app/api/nearby/route.ts`:

```ts
import { NextResponse } from "next/server";
import { TtlCache } from "@/lib/cache";
import { normaliseNearby, buildNearbyQuery, type Nearby } from "@/lib/overpass";
import { parseLatLon, roundKey, USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

// Coarse key: anything within about a kilometre shares a cached answer.
const cache = new TtlCache<Nearby[]>(7 * 24 * 60 * 60 * 1000, 500);

/**
 * Enrichment only. This endpoint always answers 200 with a list, possibly
 * empty, because Overpass fails roughly one request in three and the page is
 * built to show nothing rather than an error the user was never promised.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const params = new URL(request.url).searchParams;
  const point = parseLatLon(params);
  if (!point) return NextResponse.json({ nearby: [] });

  const key = roundKey(point.lat, point.lon, 2);
  const cached = cache.get(key);
  if (cached) return NextResponse.json({ nearby: cached });

  try {
    const upstream = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "User-Agent": USER_AGENT,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        data: buildNearbyQuery(point.lat, point.lon, 5_000),
      }),
      signal: AbortSignal.timeout(9_000),
    });

    if (!upstream.ok) return NextResponse.json({ nearby: [] });

    const nearby = normaliseNearby(await upstream.json());
    // Only a real answer is cached. Caching an empty list after a 504 would
    // poison the area for a week.
    if (nearby.length > 0) cache.set(key, nearby);
    return NextResponse.json({ nearby });
  } catch {
    return NextResponse.json({ nearby: [] });
  }
}
```

- [ ] **Step 7: Implement the search route**

Create `src/app/api/search/route.ts`:

```ts
import { NextResponse } from "next/server";
import { TtlCache, MinIntervalLimiter } from "@/lib/cache";
import { normaliseSearch, type SearchResult } from "@/lib/nominatim";
import { USER_AGENT } from "@/lib/upstream";

export const runtime = "nodejs";

const cache = new TtlCache<SearchResult[]>(60 * 60 * 1000, 200);
const limiter = new MinIntervalLimiter(1_100);

/** Forward geocode, used when geolocation is denied or unavailable. */
export async function GET(request: Request): Promise<NextResponse> {
  const query = (new URL(request.url).searchParams.get("q") ?? "").trim();
  if (query.length < 2 || query.length > 120) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const key = query.toLowerCase();
  const cached = cache.get(key);
  if (cached) return NextResponse.json({ results: cached });

  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=` +
    encodeURIComponent(query);

  try {
    await limiter.acquire();
    const upstream = await fetch(url, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    if (!upstream.ok) return NextResponse.json({ results: [] });

    const results = normaliseSearch(await upstream.json());
    cache.set(key, results);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
```

- [ ] **Step 8: Verify the routes against the live APIs by hand**

```bash
cd ~/portfolio && (npm run dev > /tmp/next-dev.log 2>&1 &) && sleep 12
echo "--- village ---"; curl -s "http://localhost:3000/api/reverse?lat=30.5123&lon=76.4412"
echo; echo "--- ocean ---"; curl -s "http://localhost:3000/api/reverse?lat=15&lon=68"
echo; echo "--- bad input ---"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:3000/api/reverse?lat=91&lon=0"
echo "--- cache hit should be instant ---"; time curl -s -o /dev/null "http://localhost:3000/api/reverse?lat=30.5123&lon=76.4412"
echo "--- search ---"; curl -s "http://localhost:3000/api/search?q=Kanyakumari" | head -c 200
echo; echo "--- nearby (may be empty, that is fine) ---"; curl -s "http://localhost:3000/api/nearby?lat=8.0883&lon=77.5385" | head -c 200
pkill -f "next dev" || true
```

Expected: village returns `{"kind":"place","name":"Panjola",...}`; ocean returns `{"kind":"nowhere"}`; bad input returns `400`; the second village call is far faster than the first; search returns results; nearby returns a list or `{"nearby":[]}` and never an error.

- [ ] **Step 9: Commit**

```bash
cd ~/portfolio
git add src/lib/upstream.ts src/lib/upstream.test.ts src/app/api
git commit -m "API routes: reverse blocks, nearby degrades, search backs the geolocation fallback"
```

---

### Task 7: The wall map

**Files:**
- Create: `src/components/dartboard/WallMap.tsx`, `src/components/dartboard/wallmap.css`

**Interfaces:**
- Consumes: `LatLon` (Task 2)
- Produces: `<WallMap origin={LatLon} radiusM={number} landing={LatLon | null} shake={boolean} />`, a client component that must be loaded with `next/dynamic` and `ssr: false` because Leaflet touches `window` at import time.

- [ ] **Step 1: Write the paper stylesheet**

Create `src/components/dartboard/wallmap.css`:

```css
.wallmap {
  position: relative;
  width: 100%;
  height: 100%;
  background: #e8e0cf;
  overflow: hidden;
}

.wallmap__canvas {
  position: absolute;
  inset: 0;
}

/* Aged paper. Applied to the tile pane only, so pin and circle keep their
   own colour. */
.wallmap__canvas .leaflet-tile-pane {
  filter: sepia(0.45) saturate(0.7) contrast(1.06) brightness(1.02);
}

/* Paper grain, generated in the browser rather than shipped as an image. */
.wallmap__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.32;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
}

.wallmap__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  box-shadow: inset 0 0 120px rgba(72, 54, 30, 0.38);
}

/* Four pins holding the map to the wall. */
.wallmap__pin {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 500;
  background: radial-gradient(circle at 35% 30%, #f0f0f0, #8d8d8d 55%, #4a4a4a);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
}
.wallmap__pin--tl { top: 14px; left: 14px; }
.wallmap__pin--tr { top: 14px; right: 14px; }
.wallmap__pin--bl { bottom: 14px; left: 14px; }
.wallmap__pin--br { bottom: 14px; right: 14px; }

@keyframes wallmap-shake {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-4px, 2px); }
  40% { transform: translate(4px, -2px); }
  60% { transform: translate(-3px, -1px); }
  80% { transform: translate(2px, 2px); }
}

.wallmap--shake .wallmap__canvas {
  animation: wallmap-shake 320ms ease-in-out;
}

/* The dart's landing mark. */
.dartpin {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #b3241c;
  border: 3px solid #f4efe2;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.45);
}

.leaflet-container {
  background: #e8e0cf;
  font: inherit;
}

@media (prefers-reduced-motion: reduce) {
  .wallmap--shake .wallmap__canvas {
    animation: none;
  }
}
```

- [ ] **Step 2: Implement the map component**

Create `src/components/dartboard/WallMap.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./wallmap.css";
import type { LatLon } from "@/lib/geo/sample";

type Props = {
  origin: LatLon;
  radiusM: number;
  landing: LatLon | null;
  shake: boolean;
};

const TILE_URL = "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  '&copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function WallMap({ origin, radiusM, landing, shake }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const circleRef = useRef<L.Circle | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Init once. The ref guard also survives React StrictMode's double-invoke
  // in development, which would otherwise leave two maps on one container.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    }).setView([origin.lat, origin.lon], 9);

    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      circleRef.current = null;
      markerRef.current = null;
    };
    // Deliberately runs once. Origin changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Radius circle, redrawn whenever the origin or the slider moves.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    circleRef.current?.remove();
    const circle = L.circle([origin.lat, origin.lon], {
      radius: radiusM,
      color: "#7a3b2e",
      weight: 2,
      dashArray: "6 6",
      fillColor: "#b3241c",
      fillOpacity: 0.06,
    }).addTo(map);
    circleRef.current = circle;

    if (!landing) map.fitBounds(circle.getBounds(), { padding: [40, 40] });
  }, [origin.lat, origin.lon, radiusM, landing]);

  // Landing pin.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRef.current?.remove();
    markerRef.current = null;
    if (!landing) return;

    const marker = L.marker([landing.lat, landing.lon], {
      icon: L.divIcon({
        className: "",
        html: '<div class="dartpin" aria-hidden="true"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      keyboard: false,
    }).addTo(map);
    markerRef.current = marker;

    map.flyTo([landing.lat, landing.lon], 11, { duration: 0.9 });
  }, [landing]);

  return (
    <div className={`wallmap${shake ? " wallmap--shake" : ""}`}>
      <div ref={containerRef} className="wallmap__canvas" />
      <div className="wallmap__grain" />
      <div className="wallmap__vignette" />
      <span className="wallmap__pin wallmap__pin--tl" />
      <span className="wallmap__pin wallmap__pin--tr" />
      <span className="wallmap__pin wallmap__pin--bl" />
      <span className="wallmap__pin wallmap__pin--br" />
    </div>
  );
}
```

- [ ] **Step 3: Verify it typechecks and builds**

Run: `cd ~/portfolio && npm run typecheck && npm run lint`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
cd ~/portfolio
git add src/components/dartboard
git commit -m "Wall map: Leaflet on filtered CARTO tiles, pinned to the wall"
```

---

### Task 8: Dartboard state machine

**Files:**
- Create: `src/components/dartboard/useDartboard.ts`

**Interfaces:**
- Consumes: `sampleInRadius`, `LatLon` (Task 2); `Landing` (Task 4); `Nearby` (Task 5); the three API routes (Task 6)
- Produces: `useDartboard()` returning
  ```ts
  {
    phase: "locating" | "ready" | "throwing" | "landed" | "error";
    origin: LatLon | null;
    radiusM: number;
    setRadiusM: (m: number) => void;
    landing: LatLon | null;
    result: Landing | null;
    nearby: Nearby[];
    error: string | null;
    needsManualLocation: boolean;
    throwDart: () => void;
    setOrigin: (origin: LatLon) => void;
  }
  ```
  Constants `MIN_RADIUS_M = 10_000` and `MAX_RADIUS_M = 500_000` are exported from this file.

- [ ] **Step 1: Implement the hook**

Create `src/components/dartboard/useDartboard.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sampleInRadius, type LatLon } from "@/lib/geo/sample";
import type { Landing } from "@/lib/nominatim";
import type { Nearby } from "@/lib/overpass";

export const MIN_RADIUS_M = 10_000;
export const MAX_RADIUS_M = 500_000;

/** Kanyakumari. Only used if geolocation is denied and no search is made. */
const FALLBACK_ORIGIN: LatLon = { lat: 8.0883, lon: 77.5385 };

export type Phase = "locating" | "ready" | "throwing" | "landed" | "error";

/** How long the dart is in the air before the result is revealed. */
const FLIGHT_MS = 700;

export function useDartboard() {
  const [phase, setPhase] = useState<Phase>("locating");
  const [origin, setOriginState] = useState<LatLon | null>(null);
  const [radiusM, setRadiusM] = useState(100_000);
  const [landing, setLanding] = useState<LatLon | null>(null);
  const [result, setResult] = useState<Landing | null>(null);
  const [nearby, setNearby] = useState<Nearby[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsManualLocation, setNeedsManualLocation] = useState(false);

  // Guards a late enrichment response from a previous throw overwriting the
  // strip belonging to the current one.
  const throwIdRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setOriginState(FALLBACK_ORIGIN);
      setNeedsManualLocation(true);
      setPhase("ready");
      return;
    }

    let settled = false;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        setOriginState({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setPhase("ready");
      },
      () => {
        if (settled) return;
        settled = true;
        // Denied or unavailable is not an error state. Give them a starting
        // point and a search box.
        setOriginState(FALLBACK_ORIGIN);
        setNeedsManualLocation(true);
        setPhase("ready");
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  const setOrigin = useCallback((next: LatLon) => {
    setOriginState(next);
    setLanding(null);
    setResult(null);
    setNearby([]);
    setError(null);
    setNeedsManualLocation(false);
    setPhase("ready");
  }, []);

  const throwDart = useCallback(() => {
    if (!origin) return;

    const point = sampleInRadius(origin, radiusM);
    const id = throwIdRef.current + 1;
    throwIdRef.current = id;

    setLanding(point);
    setResult(null);
    setNearby([]);
    setError(null);
    setPhase("throwing");

    const query = `lat=${point.lat}&lon=${point.lon}`;

    // The blocking call. The result card cannot appear before this answers.
    const reverse = fetch(`/api/reverse?${query}`).then(async (response) => {
      if (!response.ok) throw new Error("upstream");
      return (await response.json()) as Landing;
    });

    // The dart is in the air for a fixed beat, so a fast API response does not
    // make the result pop in before the animation reads as a throw.
    const flight = new Promise((resolve) => setTimeout(resolve, FLIGHT_MS));

    Promise.all([reverse, flight])
      .then(([landed]) => {
        if (throwIdRef.current !== id) return;
        setResult(landed);
        setPhase("landed");
      })
      .catch(() => {
        if (throwIdRef.current !== id) return;
        setError("Couldn't reach the map service. The dart landed, we just can't name the spot.");
        setPhase("error");
      });

    // Enrichment. Never awaited, never blocks, and a failure is silence.
    fetch(`/api/nearby?${query}`)
      .then(async (response) => (await response.json()) as { nearby?: Nearby[] })
      .then((body) => {
        if (throwIdRef.current !== id) return;
        setNearby(Array.isArray(body.nearby) ? body.nearby : []);
      })
      .catch(() => {
        /* Overpass fails about one call in three. The strip stays empty. */
      });
  }, [origin, radiusM]);

  return {
    phase,
    origin,
    radiusM,
    setRadiusM,
    landing,
    result,
    nearby,
    error,
    needsManualLocation,
    throwDart,
    setOrigin,
  };
}
```

- [ ] **Step 2: Verify it typechecks**

Run: `cd ~/portfolio && npm run typecheck && npm run lint`
Expected: both exit 0.

- [ ] **Step 3: Commit**

```bash
cd ~/portfolio
git add src/components/dartboard/useDartboard.ts
git commit -m "Dartboard state: blocking reverse, non-blocking enrichment, stale-throw guard"
```

---

### Task 9: Dartboard UI and the throw

**Files:**
- Create: `src/components/dartboard/ThrowControls.tsx`, `src/components/dartboard/LandingCard.tsx`, `src/components/dartboard/NearbyStrip.tsx`, `src/components/dartboard/Dartboard.tsx`, `src/components/dartboard/dartboard.css`
- Create: `src/app/dartboard/page.tsx`

**Interfaces:**
- Consumes: `useDartboard`, `MIN_RADIUS_M`, `MAX_RADIUS_M` (Task 8); `WallMap` (Task 7); `Landing` (Task 4); `Nearby` (Task 5); `SearchResult` (Task 4)
- Produces: route `/dartboard`

- [ ] **Step 1: Write the dartboard stylesheet**

Create `src/components/dartboard/dartboard.css`:

```css
.dartboard {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  height: 100dvh;
  background: #2b2622;
  color: #f4efe2;
}

.dartboard__stage {
  position: relative;
  min-height: 0;
}

.dartboard__panel {
  padding: 16px 20px 22px;
  background: #211d1a;
  border-top: 1px solid #3d3630;
  display: grid;
  gap: 14px;
}

.controls {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: end;
}

@media (max-width: 640px) {
  .controls { grid-template-columns: 1fr; }
}

.controls__label {
  display: block;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #a89c8c;
  margin-bottom: 6px;
}

.controls__slider { width: 100%; accent-color: #b3241c; }

.controls__throw {
  padding: 13px 30px;
  font-size: 1rem;
  font-weight: 600;
  color: #f4efe2;
  background: #b3241c;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}
.controls__throw:hover:not(:disabled) { background: #c9312a; }
.controls__throw:disabled { opacity: 0.5; cursor: not-allowed; }
.controls__throw:active:not(:disabled) { transform: translateY(1px); }

.locsearch { display: flex; gap: 8px; flex-wrap: wrap; }
.locsearch__input {
  flex: 1 1 220px;
  padding: 9px 12px;
  background: #171412;
  border: 1px solid #3d3630;
  border-radius: 3px;
  color: #f4efe2;
}
.locsearch__button {
  padding: 9px 16px;
  background: transparent;
  border: 1px solid #6b5f52;
  border-radius: 3px;
  color: #f4efe2;
  cursor: pointer;
}
.locsearch__results { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 4px; }
.locsearch__result {
  width: 100%;
  text-align: left;
  padding: 8px 10px;
  background: #171412;
  border: 1px solid #3d3630;
  border-radius: 3px;
  color: #f4efe2;
  cursor: pointer;
}

/* The dart, flying from the viewer toward the wall. */
.dart {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 44px;
  height: 44px;
  margin: -22px 0 0 -22px;
  z-index: 600;
  pointer-events: none;
  background: radial-gradient(circle at 50% 50%, #b3241c 0 32%, transparent 33%),
              linear-gradient(#f4efe2 0 100%) center/3px 44px no-repeat;
  animation: dart-throw 700ms cubic-bezier(0.3, 0.7, 0.4, 1) forwards;
}

@keyframes dart-throw {
  0%   { transform: scale(7) rotate(-24deg); opacity: 0; }
  35%  { opacity: 1; }
  100% { transform: scale(0.7) rotate(0deg); opacity: 0; }
}

.card {
  display: grid;
  gap: 6px;
  padding: 16px 18px;
  background: #171412;
  border: 1px solid #3d3630;
  border-left: 3px solid #b3241c;
  border-radius: 3px;
  animation: card-rise 260ms ease-out;
}

@keyframes card-rise {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card__name { font-size: 1.3rem; font-weight: 650; margin: 0; }
.card__area { color: #a89c8c; margin: 0; }
.card__meta { font-size: 0.82rem; color: #7d7267; margin: 0; }

.nearby { margin: 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 7px; }
.nearby__item {
  font-size: 0.82rem;
  padding: 5px 10px;
  background: #211d1a;
  border: 1px solid #3d3630;
  border-radius: 999px;
  color: #cdc2b3;
}
.nearby__heading {
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #7d7267;
  margin: 0 0 7px;
}

@media (prefers-reduced-motion: reduce) {
  .dart { animation-duration: 1ms; }
  .card { animation: none; }
}
```

- [ ] **Step 2: Implement the controls, including the location fallback**

Create `src/components/dartboard/ThrowControls.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { LatLon } from "@/lib/geo/sample";
import type { SearchResult } from "@/lib/nominatim";
import { MIN_RADIUS_M, MAX_RADIUS_M } from "./useDartboard";

type Props = {
  radiusM: number;
  onRadiusChange: (m: number) => void;
  onThrow: () => void;
  disabled: boolean;
  needsManualLocation: boolean;
  onOriginChange: (origin: LatLon) => void;
};

export default function ThrowControls({
  radiusM,
  onRadiusChange,
  onThrow,
  disabled,
  needsManualLocation,
  onOriginChange,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  async function runSearch() {
    if (query.trim().length < 2) return;
    setSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const body = (await response.json()) as { results?: SearchResult[] };
      setResults(body.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      {needsManualLocation && (
        <div className="locsearch" style={{ marginBottom: 14 }}>
          <input
            className="locsearch__input"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void runSearch();
            }}
            placeholder="Where are you? Try a town or city"
            aria-label="Search for your location"
          />
          <button
            type="button"
            className="locsearch__button"
            onClick={() => void runSearch()}
            disabled={searching}
          >
            {searching ? "Searching" : "Find it"}
          </button>
          {results.length > 0 && (
            <ul className="locsearch__results" style={{ flexBasis: "100%" }}>
              {results.map((result) => (
                <li key={`${result.lat},${result.lon}`}>
                  <button
                    type="button"
                    className="locsearch__result"
                    onClick={() => {
                      onOriginChange({ lat: result.lat, lon: result.lon });
                      setResults([]);
                      setQuery("");
                    }}
                  >
                    {result.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="controls">
        <div>
          <label className="controls__label" htmlFor="radius">
            Throwing range: {Math.round(radiusM / 1000)} km
          </label>
          <input
            id="radius"
            className="controls__slider"
            type="range"
            min={MIN_RADIUS_M}
            max={MAX_RADIUS_M}
            step={5_000}
            value={radiusM}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
          />
        </div>
        <button
          type="button"
          className="controls__throw"
          onClick={onThrow}
          disabled={disabled}
        >
          Throw the dart
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement the result card**

Create `src/components/dartboard/LandingCard.tsx`:

```tsx
import type { Landing } from "@/lib/nominatim";
import type { LatLon } from "@/lib/geo/sample";

type Props = {
  result: Landing | null;
  landing: LatLon;
  error: string | null;
};

const coords = (p: LatLon): string => `${p.lat.toFixed(4)}, ${p.lon.toFixed(4)}`;

export default function LandingCard({ result, landing, error }: Props) {
  if (error) {
    return (
      <div className="card">
        <p className="card__name">{coords(landing)}</p>
        <p className="card__area">{error}</p>
        <p className="card__meta">Throw again, or try the same spot in a moment.</p>
      </div>
    );
  }

  if (!result) return null;

  if (result.kind === "nowhere") {
    return (
      <div className="card">
        <p className="card__name">Nothing named here</p>
        <p className="card__area">
          The map has no record of this spot. Most likely open water, possibly
          just unmapped ground.
        </p>
        <p className="card__meta">{coords(landing)}</p>
      </div>
    );
  }

  const where = [result.area, result.country].filter(Boolean).join(", ");

  return (
    <div className="card">
      <p className="card__name">{result.name}</p>
      {where && <p className="card__area">{where}</p>}
      <p className="card__meta">
        {result.category.replace(/_/g, " ")} · {coords(landing)}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Implement the enrichment strip**

Create `src/components/dartboard/NearbyStrip.tsx`:

```tsx
import type { Nearby } from "@/lib/overpass";

/**
 * Renders nothing when Overpass gave us nothing, which is often. The user was
 * never promised this, so its absence is not an error state.
 */
export default function NearbyStrip({ nearby }: { nearby: Nearby[] }) {
  if (nearby.length === 0) return null;

  return (
    <div>
      <p className="nearby__heading">While you're there</p>
      <ul className="nearby">
        {nearby.map((item) => (
          <li key={`${item.name}-${item.lat}`} className="nearby__item">
            {item.name}
            <span style={{ color: "#7d7267" }}> · {item.kind.replace(/_/g, " ")}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Compose the dartboard**

Create `src/components/dartboard/Dartboard.tsx`:

```tsx
"use client";

import dynamic from "next/dynamic";
import { useDartboard } from "./useDartboard";
import ThrowControls from "./ThrowControls";
import LandingCard from "./LandingCard";
import NearbyStrip from "./NearbyStrip";
import "./dartboard.css";

// Leaflet reads `window` at import time, so it can never be server-rendered.
const WallMap = dynamic(() => import("./WallMap"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: "100%", background: "#e8e0cf" }} />,
});

export default function Dartboard() {
  const board = useDartboard();

  return (
    <main className="dartboard">
      <div className="dartboard__stage">
        {board.origin && (
          <WallMap
            origin={board.origin}
            radiusM={board.radiusM}
            landing={board.phase === "throwing" ? null : board.landing}
            shake={board.phase === "landed" || board.phase === "error"}
          />
        )}
        {board.phase === "throwing" && <div className="dart" aria-hidden="true" />}
      </div>

      <div className="dartboard__panel">
        <ThrowControls
          radiusM={board.radiusM}
          onRadiusChange={board.setRadiusM}
          onThrow={board.throwDart}
          disabled={board.phase === "locating" || board.phase === "throwing"}
          needsManualLocation={board.needsManualLocation}
          onOriginChange={board.setOrigin}
        />

        <div aria-live="polite">
          {board.landing && board.phase !== "throwing" && (
            <LandingCard
              result={board.result}
              landing={board.landing}
              error={board.error}
            />
          )}
          <div style={{ marginTop: 12 }}>
            <NearbyStrip nearby={board.nearby} />
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Add the route**

Create `src/app/dartboard/page.tsx`:

```tsx
import type { Metadata } from "next";
import Dartboard from "@/components/dartboard/Dartboard";

export const metadata: Metadata = {
  title: "Dartboard — Abilash",
  description:
    "A wall map you throw a dart at. Pick a range, throw, go wherever it lands.",
};

export default function DartboardPage() {
  return (
    <>
      <noscript>
        <p style={{ padding: 24 }}>
          The dartboard needs JavaScript. The rest of the site does not.
        </p>
      </noscript>
      <Dartboard />
    </>
  );
}
```

- [ ] **Step 7: Verify it runs and a throw works end to end**

```bash
cd ~/portfolio && npm run typecheck && npm run lint && npm run build
```

Expected: all exit 0. Then run `npm run dev`, open `http://localhost:3000/dartboard`, allow or deny location, move the slider, and throw. Confirm the circle resizes live, the dart animates, a card appears with a real place name, and the map is credited to OpenStreetMap and CARTO.

- [ ] **Step 8: Commit**

```bash
cd ~/portfolio
git add src/components/dartboard src/app/dartboard
git commit -m "Dartboard UI: wind-up, flight, pin, card, optional enrichment"
```

---

### Task 10: The portfolio home page

**Files:**
- Create: `src/content/case-studies.ts`, `src/components/site/Hero.tsx`, `src/components/site/CaseStudy.tsx`, `src/components/site/Footer.tsx`, `src/components/site/site.css`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: nothing
- Produces: route `/`

- [ ] **Step 1: Write the case study content**

Wording is fixed by Global Constraints. Create `src/content/case-studies.ts`:

```ts
export type CaseStudy = {
  slug: string;
  title: string;
  stack: string[];
  headline: string;
  body: string[];
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "render-reliability",
    title: "The render failures that survived a week of debugging",
    stack: ["Java", "Spring Boot", "AWS EFS", "MLT", "GKE"],
    headline: "Render success sat at 60%. It took a root cause nobody expected to reach 98%.",
    body: [
      "Renders failed roughly four times in ten, and the failures were not reproducible on demand. The whole team had spent a week on it. Retries papered over some of it and made the cost problem worse.",
      "The output files were corrupt rather than missing, which pointed at the write path instead of the render logic. The pipeline read and wrote media on shared EFS storage while several renders ran concurrently, and concurrent access was corrupting MOV atoms mid-write. The renderer was doing its job on input that had already been damaged.",
      "The fix was to stop rendering against shared storage: stage media on pod-local ephemeral disk first, render there, then publish. Success rate went from 60% to 98%.",
      "The lesson I keep from it is that a week of looking at the wrong layer beats no time at all, but only if you eventually ask which layer the evidence actually implicates. Corrupt output was the tell, and it was there the whole time.",
    ],
  },
  {
    slug: "cloud-cost",
    title: "Cutting cloud spend around 40%, in two unrelated pieces of work",
    stack: ["Redis", "GCP Pub/Sub", "Cloud Run", "KEDA", "Kafka"],
    headline: "A cache win and an autoscaling win. They add up, but they are not one story.",
    body: [
      "The first was a segment-level Redis cache over the personalised media pipeline. Renders are personalised, but not uniquely: users share first names, birth dates, and other parameters, so the TTS, voice-clone and lip-sync segments generated for them are frequently identical. Caching at the segment level rather than the render level reached about an 80% hit rate and removed roughly 30% of monthly infrastructure spend.",
      "The second was autoscaling. Render workers ran on GKE with KEDA scaling on Kafka consumer lag, which worked but kept pods warm through quiet stretches. Moving to Cloud Run behind a Pub/Sub queue-depth autoscaler allowed genuine scale-to-zero, cutting a further 10%.",
      "I keep these separate when I talk about them. They are independent wins on independent problems, and folding them into one 40% headline would make the reasoning behind each of them disappear.",
    ],
  },
  {
    slug: "config-playground",
    title: "A config playground built on the Visitor pattern",
    stack: ["Java", "Design patterns", "Internal tooling"],
    headline: "Config approval went from three days to one, by letting non-engineers try things.",
    body: [
      "Solution engineers needed to tune TTS, voice-clone, lip-sync and video-template configuration per client, and every iteration went through an engineer. Three days per approval cycle, most of it waiting.",
      "The config types were a small, closed, and stable set, with operations over them that kept growing: validate, preview, serialise, diff. That shape is what the Visitor pattern is for, so the operations live outside the config types and a new one is a new visitor rather than a change to every node.",
      "Wrapped in a playground UI, it let the solution engineering team iterate against live client previews without an engineer in the loop. The approval cycle went from three days to one.",
    ],
  },
  {
    slug: "dartboard",
    title: "This site's dartboard",
    stack: ["Next.js", "TypeScript", "Leaflet", "OpenStreetMap"],
    headline: "A wall map you throw a dart at, built around an API that fails one call in three.",
    body: [
      "Pick a range from where you are, throw a dart, go wherever it lands. The sampling is uniform over the area of the circle rather than over its radius, which is a one-character difference in the code and the difference between a real throw and one that clusters in the middle.",
      "The interesting constraint was Overpass, the OpenStreetMap query API that finds interesting things near a point. Measured before any code was written, three identical requests returned a timeout, a ten-second success, and a rate limit. So it is not on the critical path: Nominatim names the landing spot in under a second and the card renders, then Overpass fills in what else is nearby if it feels like answering.",
      "If the dart lands in the sea, the site says so. Silently re-rolling until it hit land would bias the distribution while still calling itself random.",
    ],
  },
];
```

- [ ] **Step 2: Write the site stylesheet**

Create `src/components/site/site.css`:

```css
:root {
  --ink: #1c1a17;
  --paper: #f4f1ea;
  --muted: #6b635a;
  --rule: #ddd6c9;
  --accent: #b3241c;
}

.site {
  max-width: 46rem;
  margin: 0 auto;
  padding: 0 22px 90px;
  color: var(--ink);
}

.hero { padding: 88px 0 52px; }
.hero__name {
  font-size: clamp(2rem, 6vw, 2.9rem);
  line-height: 1.1;
  margin: 0 0 18px;
  letter-spacing: -0.02em;
}
.hero__lede { font-size: 1.12rem; line-height: 1.65; margin: 0 0 16px; }
.hero__lede--muted { color: var(--muted); }
.hero__dart {
  display: inline-block;
  margin-top: 22px;
  padding: 11px 20px;
  background: var(--accent);
  color: var(--paper);
  text-decoration: none;
  border-radius: 3px;
  font-weight: 600;
}
.hero__dart:hover { background: #c9312a; }

.study { padding: 40px 0; border-top: 1px solid var(--rule); }
.study__title { font-size: 1.42rem; line-height: 1.25; margin: 0 0 10px; letter-spacing: -0.01em; }
.study__headline { font-size: 1.04rem; color: var(--muted); margin: 0 0 18px; }
.study__body p { line-height: 1.72; margin: 0 0 15px; }
.study__stack { display: flex; flex-wrap: wrap; gap: 7px; margin: 18px 0 0; padding: 0; list-style: none; }
.study__tech {
  font-size: 0.76rem;
  letter-spacing: 0.03em;
  padding: 4px 10px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  color: var(--muted);
}

.footer { padding: 44px 0 0; border-top: 1px solid var(--rule); color: var(--muted); }
.footer__links { display: flex; flex-wrap: wrap; gap: 18px; margin: 0 0 16px; padding: 0; list-style: none; }
.footer a { color: var(--ink); }

@media (prefers-color-scheme: dark) {
  :root {
    --ink: #ece7dd;
    --paper: #16140f;
    --muted: #9b9186;
    --rule: #322d26;
  }
}
```

- [ ] **Step 3: Implement the site components**

Create `src/components/site/Hero.tsx`:

```tsx
export default function Hero() {
  return (
    <header className="hero">
      <h1 className="hero__name">Abilash S L</h1>
      <p className="hero__lede">
        Backend engineer. I work on the video rendering pipeline at Whilter,
        which turns out about 25,000 renders a day across GKE and Cloud Run,
        written in Java and Spring Boot over Kafka, Redis and MongoDB.
      </p>
      <p className="hero__lede hero__lede--muted">
        Most of what I do lands on either the cloud bill or the on-call
        dashboard: how media gets cached, how render jobs get queued and
        scaled, and what breaks when shared storage, concurrency and bursty
        traffic arrive at the same time.
      </p>
      <a className="hero__dart" href="/dartboard">
        Throw a dart at a map
      </a>
    </header>
  );
}
```

Create `src/components/site/CaseStudy.tsx`:

```tsx
import type { CaseStudy as Study } from "@/content/case-studies";

export default function CaseStudy({ study }: { study: Study }) {
  return (
    <article className="study" id={study.slug}>
      <h2 className="study__title">{study.title}</h2>
      <p className="study__headline">{study.headline}</p>
      <div className="study__body">
        {study.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
      <ul className="study__stack">
        {study.stack.map((tech) => (
          <li key={tech} className="study__tech">
            {tech}
          </li>
        ))}
      </ul>
    </article>
  );
}
```

Create `src/components/site/Footer.tsx`:

```tsx
export default function Footer() {
  return (
    <footer className="footer">
      <ul className="footer__links">
        <li>
          <a href="https://www.linkedin.com/in/abilash0045/">LinkedIn</a>
        </li>
        <li>
          <a href="https://github.com/abilash0045">GitHub</a>
        </li>
        <li>
          <a href="mailto:abilash0045@gmail.com">abilash0045@gmail.com</a>
        </li>
      </ul>
      <p>
        This site is{" "}
        <a href="https://github.com/abilash0045/portfolio">open source</a>. Maps
        from{" "}
        <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>{" "}
        contributors.
      </p>
    </footer>
  );
}
```

- [ ] **Step 4: Wire the home page and layout**

Replace `src/app/page.tsx`:

```tsx
import Hero from "@/components/site/Hero";
import CaseStudy from "@/components/site/CaseStudy";
import Footer from "@/components/site/Footer";
import { caseStudies } from "@/content/case-studies";
import "@/components/site/site.css";

export default function Home() {
  return (
    <div className="site">
      <Hero />
      {caseStudies.map((study) => (
        <CaseStudy key={study.slug} study={study} />
      ))}
      <Footer />
    </div>
  );
}
```

Replace the contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Abilash S L — Backend engineer",
  description:
    "Backend engineer working on a 25,000-renders-a-day video pipeline. Java, Spring Boot, Kafka, GCP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Replace `src/app/globals.css`:

```css
*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  background: #f4f1ea;
  color: #1c1a17;
  font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

@media (prefers-color-scheme: dark) {
  body { background: #16140f; color: #ece7dd; }
}

img, svg { max-width: 100%; display: block; }

a { color: inherit; text-underline-offset: 3px; }

:focus-visible { outline: 2px solid #b3241c; outline-offset: 2px; }
```

- [ ] **Step 5: Check the copy against the Global Constraints before committing**

Read every string in `src/content/case-studies.ts`, `Hero.tsx` and `Footer.tsx` and confirm: no em-dashes, no banned lexicon, no "open to work" or compensation or relocation language, the 60→98% win is attributed to the EFS/MOV-atom root cause and not KEDA, and the ~30% and ~10% cost wins are still described as separate.

```bash
cd ~/portfolio && grep -rn "—" src/ || echo "no em-dashes: pass"
cd ~/portfolio && grep -rniE "open to work|LPA|relocat|delve|leverage|seamless|robust|comprehensive|crucial|pivotal|elevate|empower|foster|streamline|supercharge|game.chang|cutting.edge|next.generation|tapestry|myriad|plethora" src/ || echo "no banned terms: pass"
```

Expected: both print their pass line. If either prints matches, rewrite the whole sentence rather than swapping the word.

- [ ] **Step 6: Verify the build**

Run: `cd ~/portfolio && npm run typecheck && npm run lint && npm run build`
Expected: all exit 0.

- [ ] **Step 7: Commit**

```bash
cd ~/portfolio
git add src/content src/components/site src/app/page.tsx src/app/layout.tsx src/app/globals.css
git commit -m "Portfolio home: four case studies, resume-level detail only"
```

---

### Task 11: End-to-end tests, contract check, and Lighthouse

**Files:**
- Create: `playwright.config.ts`, `e2e/dartboard.spec.ts`, `e2e/home.spec.ts`
- Create: `contract/live-api.test.ts`
- Create: `.github/workflows/contract-check.yml`, `lighthouserc.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: routes `/` and `/dartboard` (Tasks 9, 10); `normaliseReverse`, `normaliseNearby` (Tasks 4, 5)
- Produces: `npm run test:e2e` and `npm run test:contract` both runnable

- [ ] **Step 1: Configure Playwright**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    // Chandigarh. Granted below so the dartboard never waits on a real prompt.
    geolocation: { latitude: 30.7333, longitude: 76.7794 },
    permissions: ["geolocation"],
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Write the end-to-end tests**

Create `e2e/home.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("home page carries the work and links to the dartboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Abilash S L" })).toBeVisible();
  await expect(page.getByText("25,000")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /render failures that survived a week/i,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: /throw a dart at a map/i }).click();
  await expect(page).toHaveURL(/\/dartboard$/);
});

test("home page never advertises a job search", async ({ page }) => {
  await page.goto("/");
  const body = (await page.textContent("body")) ?? "";
  expect(body.toLowerCase()).not.toContain("open to work");
  expect(body.toLowerCase()).not.toContain("lpa");
});
```

Create `e2e/dartboard.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("throwing a dart lands somewhere real", async ({ page }) => {
  await page.goto("/dartboard");

  const throwButton = page.getByRole("button", { name: /throw the dart/i });
  await expect(throwButton).toBeEnabled({ timeout: 15_000 });

  await expect(page.getByText(/throwing range/i)).toBeVisible();
  await throwButton.click();

  // The card is gated on the reverse geocode, which is a live call.
  const card = page.locator(".card");
  await expect(card).toBeVisible({ timeout: 25_000 });

  const text = (await card.textContent()) ?? "";
  expect(text.trim().length).toBeGreaterThan(0);
  // Every outcome the card can render carries a coordinate pair.
  expect(text).toMatch(/-?\d+\.\d{4},\s*-?\d+\.\d{4}/);
});

test("the radius slider changes the stated range", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.getByRole("button", { name: /throw the dart/i })).toBeEnabled({
    timeout: 15_000,
  });

  const before = await page.getByText(/throwing range/i).textContent();
  await page.locator("#radius").fill("400000");
  const after = await page.getByText(/throwing range/i).textContent();

  expect(after).not.toBe(before);
  expect(after).toContain("400 km");
});

test("the map credits OpenStreetMap", async ({ page }) => {
  await page.goto("/dartboard");
  await expect(page.locator(".leaflet-control-attribution")).toContainText(
    "OpenStreetMap",
    { timeout: 20_000 },
  );
});
```

- [ ] **Step 3: Run the end-to-end tests**

Run: `cd ~/portfolio && npm run test:e2e`
Expected: all four tests pass. The dartboard test makes a live Nominatim call, which is acceptable here because Nominatim answered three of three under a second when measured. If it is flaky in practice, raise the timeout rather than stubbing the route, since stubbing would leave the throw untested.

- [ ] **Step 4: Write the live contract check**

Create `contract/live-api.test.ts`:

```ts
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
```

- [ ] **Step 5: Run the contract check**

Run: `cd ~/portfolio && npm run test:contract`
Expected: both Nominatim tests pass. The Overpass test passes whether or not Overpass answers.

- [ ] **Step 6: Add the contract-check workflow**

Create `.github/workflows/contract-check.yml`:

```yaml
name: contract-check

on:
  schedule:
    # 06:00 UTC every Monday.
    - cron: "0 6 * * 1"
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - id: contract
        run: npm run test:contract
      - name: Open an issue when the upstream shape has drifted
        if: failure()
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "Nominatim response shape drifted ($(date -u +%Y-%m-%d))" \
            --body "The weekly contract check failed. The recorded fixtures in \`tests/fixtures/\` may no longer match what Nominatim returns, which means the unit tests are passing against a stale contract.

          Run \`npm run test:contract\` locally, then re-record the fixtures per Task 4 Step 1 of \`docs/superpowers/plans/2026-08-05-portfolio-dartboard.md\` if the shape really has changed.

          Workflow run: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}" \
            --label "upstream" || true
```

- [ ] **Step 7: Add the Lighthouse job to CI**

Create `lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run start",
      "url": ["http://localhost:3000/", "http://localhost:3000/dartboard"],
      "numberOfRuns": 1
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.85 }],
        "categories:accessibility": ["warn", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

Append this job to `.github/workflows/ci.yml`:

```yaml
  lighthouse:
    runs-on: ubuntu-latest
    # Informational. A portfolio's broken deploy is not an incident, so this
    # reports and never blocks.
    continue-on-error: true
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm
      - run: npm ci
      - run: npm run build
      - run: npm i -g @lhci/cli
      - run: lhci autorun --config=lighthouserc.json
```

- [ ] **Step 8: Verify the whole suite locally, then push and confirm CI**

```bash
cd ~/portfolio
npm run typecheck && npm run lint && npm run test:unit && npm run build && npm run test:e2e
git add playwright.config.ts e2e contract lighthouserc.json .github/workflows
git commit -m "E2E, weekly live contract check, and an informational Lighthouse pass"
git push
sleep 60 && gh run list --limit 3
```

Expected: local suite all green, then the pushed CI run reports success. Fix any failure before continuing.

- [ ] **Step 9: Prove the contract check works by running it on demand**

```bash
cd ~/portfolio && gh workflow run contract-check.yml && sleep 60 && gh run list --workflow=contract-check.yml --limit 1
```

Expected: the run completes successfully. A workflow that has never been executed is not known to work.

---

### Task 12: Deploy, and enable remote development

**Files:**
- Modify: `NOTES.md`, `README.md`

**Interfaces:**
- Consumes: everything
- Produces: a live site, and cloud sessions that can build and test this repo from a phone

- [ ] **Step 1: Write the README**

Create `README.md`:

```markdown
# portfolio

Personal site, and a wall map you throw a dart at.

Design and rationale: [`docs/DESIGN.md`](docs/DESIGN.md). Running decisions: [`NOTES.md`](NOTES.md).

## Running it

```bash
npm ci
npm run dev
```

## Tests

| Command | What it does |
|---|---|
| `npm run test:unit` | Pure logic against fixtures recorded from real calls. Runs in CI. |
| `npm run test:e2e` | Playwright against a real build. Runs in CI. |
| `npm run test:contract` | Hits the live OpenStreetMap APIs. Weekly, never in CI. |

The split exists because Overpass fails roughly one request in three. Calling
it from CI would fail about one build in three for reasons unrelated to the
commit, so upstream drift is caught by a scheduled job instead.

## Notes on the dart

The landing point is sampled uniformly over the area of the circle, not over
its radius. Without the square root in `src/lib/geo/sample.ts`, darts crowd
the centre. `sample.test.ts` asserts the distribution and fails if it is
removed.

If the dart lands in water, the site says so rather than re-rolling. Silently
re-throwing until it hits land would bias the distribution while still calling
itself random.

Maps © OpenStreetMap contributors, © CARTO.
```

- [ ] **Step 2: Connect Vercel — Abilash does this in a browser**

This cannot be scripted. Steps for him:

1. Go to vercel.com, sign in with GitHub.
2. Add New → Project → import `abilash0045/portfolio`.
3. Framework preset should auto-detect Next.js. No environment variables are needed; the app has no secrets.
4. Deploy.

This gives a preview deploy per pull request and a production deploy on `main` automatically.

- [ ] **Step 3: Verify the deployment is real**

Once Vercel reports a URL, check it end to end rather than trusting the dashboard:

```bash
SITE="https://<the-vercel-url>"
curl -s -o /dev/null -w "home: %{http_code}\n" "$SITE/"
curl -s -o /dev/null -w "dartboard: %{http_code}\n" "$SITE/dartboard"
echo "reverse:"; curl -s "$SITE/api/reverse?lat=30.5123&lon=76.4412"
echo; echo "ocean:"; curl -s "$SITE/api/reverse?lat=15&lon=68"
```

Expected: both pages 200, the reverse call names a place, the ocean call returns `{"kind":"nowhere"}`. If the API routes fail in production but worked locally, check the Vercel function logs before changing code.

- [ ] **Step 4: Sync GitHub access for cloud sessions**

`gh` is already authenticated locally with `repo` and `workflow` scopes. In a Claude Code terminal session, run:

```
/web-setup
```

This syncs the local `gh` token to the Claude account so cloud sessions can clone and push.

- [ ] **Step 5: Install the Claude GitHub App — Abilash does this in a browser**

Auto-fix needs it. Go to https://github.com/apps/claude and install it on `abilash0045/portfolio`.

- [ ] **Step 6: Create the cloud environment — Abilash does this in a browser**

At claude.ai/code, open the environment selector (the cloud icon above the message box), then Add cloud environment:

- Name: `portfolio`
- Network access: **Custom**, with "also include default list of common package managers" checked
- Allowed domains:
  ```
  nominatim.openstreetmap.org
  overpass-api.de
  tile.openstreetmap.org
  basemaps.cartocdn.com
  *.basemaps.cartocdn.com
  cdn.playwright.dev
  ```
- Setup script: leave empty. Node 22 is pre-installed and `scripts/install_pkgs.sh` handles `npm ci` via the SessionStart hook committed in Task 1.

The default Trusted level allowlists npm and GitHub but none of these, so without this step nothing live works from a phone.

Then run `/remote-env` in a terminal session and select `portfolio` so CLI cloud sessions use it.

- [ ] **Step 7: Prove a cloud session actually works**

Do not assume it works because it was configured. From a terminal:

```bash
cd ~/portfolio
claude --cloud "Run npm ci, npm run test:unit and npm run test:contract, then report which passed. Do not change any code."
```

Expected: the session clones the repo, installs, and reports unit tests passing and the Nominatim contract tests passing. If the contract tests fail on a network error, the allowed-domains list in Step 6 was not applied. Monitor it from the Claude mobile app to confirm the phone path works.

- [ ] **Step 8: Enable Remote Control for steering from the phone**

For continuing desk work from a phone, which is a different thing from a cloud session:

```bash
cd ~/portfolio && claude --remote-control "portfolio"
```

Press spacebar for a QR code, scan it with the Claude mobile app. This session runs on the Mac and ends if the laptop sleeps or the process stops.

- [ ] **Step 9: Update NOTES.md and close out**

Mark the progress checkboxes and the manual steps done in `NOTES.md`, and record the live URL. Then:

```bash
cd ~/portfolio
git add README.md NOTES.md
git commit -m "README, and notes on what is deployed"
git push
```

- [ ] **Step 10: Test the whole mobile loop once, deliberately**

The point of all of this is a loop that closes without a laptop. Verify it end to end:

1. From the Claude mobile app, start a cloud session on the repo and ask for a small real change, for example adding a `/health` route that returns `{ ok: true }`.
2. Have it open a pull request.
3. Watch CI run on the PR.
4. Turn on Auto-fix from the mobile app if CI fails, and confirm Claude pushes a fix.
5. Check the Vercel preview URL from the phone.
6. Merge.

If any step needs the laptop, the setup is not finished. Note in `NOTES.md` which step broke and why.

---

## Self-Review

**Spec coverage.** Every section of `docs/DESIGN.md` maps to a task: dart algorithm → Task 2; `/api/reverse` including the `Landing` type, rounding, TTL and rate limiting → Tasks 3, 4, 6; `/api/nearby` → Tasks 5, 6; the failure-handling table → geolocation fallback in Tasks 8 and 9, water in Task 9's `LandingCard`, Nominatim 5xx in Task 8's error branch and Task 9's error card, Overpass silence in Task 9's `NearbyStrip`, tile failure by Leaflet's own behaviour, JS disabled by the `<noscript>` in Task 9; visual direction → Task 7 and Task 9 stylesheets; content → Task 10; testing → Tasks 2 to 6 and 11; repo and CI/CD → Tasks 1 and 11; remote development → Tasks 1 and 12; attribution → Task 7's `ATTRIBUTION`, Task 10's footer, and asserted by an e2e test in Task 11.

**Deviations from the spec, deliberate.** The spec's failure table says a Nominatim timeout shows "the coordinates and a plain line, with a retry"; Task 9's error card shows coordinates and the message but points at the existing throw button rather than adding a separate retry control, since the throw button is right there and unused. The spec named three case studies plus the dartboard; Task 10 implements exactly those four.

**Placeholders.** None. Every code step carries complete code, every verification step names the command and the expected result.

**Type consistency.** `LatLon` from `src/lib/geo/sample.ts` is used by Tasks 7, 8, 9. `Landing` from `src/lib/nominatim.ts` is used by Tasks 6, 8, 9 and is the two-variant version with no `reason` field, matching the corrected spec. `Nearby` from `src/lib/overpass.ts` is used by Tasks 6, 8, 9. `SearchResult` is used by Tasks 6 and 9. `MIN_RADIUS_M` and `MAX_RADIUS_M` are exported from `useDartboard.ts` in Task 8 and imported by `ThrowControls.tsx` in Task 9. The `WallMap` props in Task 7 (`origin`, `radiusM`, `landing`, `shake`) match the call site in Task 9.

**Known risk.** Task 4 Step 1 and Task 5 Step 1 record fixtures from live APIs, so exact place names depend on OpenStreetMap data at the time of capture. Both steps say to adjust the test expectations to the recorded file rather than editing the fixture, which keeps the fixture honest.
