# Portfolio + Dartboard — Design

Date: 2026-08-05
Owner: S L Abilash
Status: approved, pre-implementation

## What this is

A personal portfolio at `/` and a working dart-throwing wall map at `/dartboard`.

The portfolio exists because Abilash's public GitHub does not represent his ability. It is 32 repos,
mostly forks (clawdbot, agenticSeek, build-your-own-x, palmier-pro) and 2023-era college work
(blinkit-clone, startup-landing-page, bestBuy). His real work — a 25k/day video render pipeline — sits
behind an employer firewall. The portfolio's job is to carry that work in written form, credibly.

The dartboard exists because a portfolio with no personality is forgettable, and because it is a real
piece of engineering: geospatial sampling, a flaky third-party API, and a graceful-degradation problem.
It is the only thing on the site whose source a reader can actually inspect.

## Constraints

- Public and indexed. Abilash is currently employed at Whilter and his job search is deliberately
  soft-signal. No "open to work", no compensation figures, no relocation intent on the page.
- Employer detail is capped at what his resume and LinkedIn already say publicly. Numbers, tech, and
  narrative are in. Internal service names, client names, config specifics, and real architecture
  diagrams of Whilter's system are out.
- Nothing mocked. Every feature calls real APIs and handles real failures. No fixture data standing in
  for a live call, anywhere.
- Two tracking files total: this document, and `NOTES.md` for running progress and decisions.

## Stack

Next.js (App Router) on Vercel, TypeScript, Leaflet for the map. No CSS framework — the visual
direction is specific enough that utility classes would fight it. No component library.

Vercel is chosen for its API routes. Nominatim and Overpass both send `access-control-allow-origin: *`,
so the browser is not blocked from calling them directly — the server layer is for response caching and
for keeping the shared rate limit under our control rather than exposing it to every visitor's browser.

Leaflet over MapLibre GL: 42KB against 200KB+, and CSS filters apply cleanly to a raster tile layer,
which is how the aged-paper look is achieved.

## Verified API behaviour

Measured 2026-08-05, not assumed. These measurements are why the architecture is shaped the way it is.

Nominatim reverse (`nominatim.openstreetmap.org/reverse`):
- Three sequential calls: all HTTP 200, 0.39s / 0.93s / 0.88s.
- Sends `access-control-allow-origin: *`.
- Rural point in Punjab (30.5123, 76.4412) returned `Panjola, Fatehgarh Sahib Tahsil, Punjab` as a
  `village`. Thar desert (27.2, 71.0) returned `Jonara` as an `isolated_dwelling`.
- Ocean point (15.0, 68.0) returned `{"error": "Unable to geocode"}`.

Overpass (`overpass-api.de/api/interpreter`):
- Three identical sequential queries: HTTP 504 at 8.3s, HTTP 200 at 10.5s, HTTP 429 at 8.7s.
- Mirrors `overpass.private.coffee` and `overpass.kumi.systems` both timed out at 45s.
- When it succeeds it is good: a 40km query around Kanyakumari returned Swami Vivekananda Rock
  Memorial, Sunset Point, Mathur Hanging Aqueduct, Kamaraj Mandapam, and Tonys Internetcafe.

Tiles: `tile.openstreetmap.org` HTTP 200 in 0.16s; `basemaps.cartocdn.com` HTTP 200.

**The conclusion that drives the design: Overpass cannot be on the critical path.** A 1-in-3 failure
rate with 8-to-10-second latency would make the dart throw feel broken. Nominatim carries the throw;
Overpass is optional enrichment that arrives late or not at all.

## The dart algorithm

Sample uniformly over the circle's *area*, then project with the spherical destination-point formula.

```
θ = 2π · random()                                          // bearing, uniform
r = R · √(random())                                        // √ distributes over area, not radius
δ = r / 6_371_000                                          // angular distance, mean Earth radius
lat₂ = asin(sin lat₁ · cos δ + cos lat₁ · sin δ · cos θ)
lon₂ = lon₁ + atan2(sin θ · sin δ · cos lat₁,
                    cos δ − sin lat₁ · sin lat₂)
```

Two notes on why it is written this way.

The square root is load-bearing. Sampling `r = R · random()` puts far too many darts near the centre,
because the area of an annulus grows with radius. Dropping the √ is the single most common bug in this
kind of code and the uniformity test exists to catch its regression.

The spherical formula is used instead of a flat-earth degree offset because the flat approximation
drifts badly at a 500km radius and breaks near the poles. It is five lines either way, so there is no
reason to use the wrong one. Longitude is normalised into [-180, 180] after the addition so throws that
cross the antimeridian land correctly.

`Math.random()` is sufficient. This is a toy, not a lottery, and crypto randomness would be a false
signal of rigour.

## Architecture

```
Browser (/dartboard)
  │
  ├─ navigator.geolocation ──► origin, or manual search fallback
  │
  ├─ throw: sample point locally (pure function, no network)
  │
  ├─ GET /api/reverse?lat&lon ──────────► Nominatim          BLOCKING, ~1s
  │     └─ card renders here. The throw is complete.
  │
  └─ GET /api/nearby?lat&lon ───────────► Overpass           NON-BLOCKING, may never resolve
        └─ if it lands, a "while you're there" strip appears beneath the card.
           If it 504s, 429s, or times out, nothing appears and nothing is broken.
```

### `/api/reverse`

Proxies Nominatim with a `User-Agent` identifying the site. Caches on rounded coordinates (3 decimal
places, ~110m) with a long TTL — the name of a place does not change. Returns a normalised shape so the
client never parses Nominatim's raw response:

```ts
type Landing =
  | { kind: "place";   name: string; area: string; country: string; category: string }
  | { kind: "nowhere"; reason: "water" | "unmapped" }
```

`Unable to geocode` maps to `kind: "nowhere"`. Any other upstream failure surfaces as an error the UI
reports plainly; it does not silently become "nowhere", because a network failure and an empty ocean are
different facts and conflating them would be a lie in the UI.

### `/api/nearby`

Proxies Overpass with an aggressive server-side cache keyed on coarse coordinates (2 decimal places,
~1.1km) and a short client-side timeout. Queries named nodes tagged `tourism`, `natural=beach`, or
`amenity` within 5km. Returns `[]` on any failure — this endpoint is allowed to fail silently because
its output is decorative.

### Rate limiting

Nominatim's policy is one request per second, absolute. The route enforces this itself with an in-process
token bucket rather than trusting traffic to be low. On Vercel's serverless model the bucket is per
instance, not global, so it is a mitigation and not a guarantee; the response cache is the primary
defence and the bucket is the backstop. Requests that would exceed the budget wait rather than fail.

## Failure handling

Every external dependency here fails in normal operation. Handling is specified per case rather than
left to a generic error boundary.

| Failure | Behaviour |
|---|---|
| Geolocation denied or unavailable | Location search box via Nominatim `/search`. Not a dead end. |
| Dart lands in water | The card says so, honestly. This is the intended joke, not an error. |
| Nominatim 5xx / timeout | Card shows the coordinates and a plain "couldn't reach the map service" line, with a retry. The dart still landed; only the name is missing. |
| Overpass anything | Strip does not appear. No error shown — the user was never promised it. |
| Tiles fail to load | Leaflet's own grey tiles. The pin and card still work. |
| JS disabled | `/` reads fine as a document. `/dartboard` shows a line explaining it needs JS. |

## Visual direction

The map should read as a paper map on a wall, not as default Leaflet.

CARTO light raster tiles, filtered toward aged paper (sepia with lifted contrast), a grain overlay, and
pinned corners. The circle showing the throwing radius updates live as the slider moves, so the area
visibly grows and shrinks before the throw.

The throw: wind-up on mousedown, release on mouseup. The dart scales down as it flies — large to small
reads as travelling away from the viewer, toward the wall. Impact shakes the map briefly, the pin thunks
in, the card slides up. CSS transforms only, no animation library.

Radius slider spans 10km to 500km.

Anti-slop rules from the global voice spec apply: no purple gradient, no three-card grid, no centred
hero with a generic tagline. Motion respects `prefers-reduced-motion` — the dart snaps to its landing
point instead of animating.

## Content

Case studies, in this order. The first leads because "resisted a week of team-wide investigation" is the
most interview-relevant sentence Abilash has.

1. **The render failures that survived a week of debugging.** Render success stuck at 60%. Root cause
   was MOV atom corruption from concurrent EFS reads and writes during render. Fix was staging media on
   pod-local ephemeral disk before render. Result 60% → 98%. Written as an investigation, not a summary:
   what was tried, what ruled things out, what the actual mechanism was.
2. **Cutting cloud spend ~40%, twice, for different reasons.** Segment-level Redis cache deduplicating
   TTS, voice-clone and lip-sync segments across users with overlapping params, ~80% hit rate, ~30% of
   the saving. Then migrating render autoscaling from KEDA-on-GKE (Kafka lag) to a Pub/Sub queue-depth
   Cloud Run autoscaler, scale-to-zero killing idle-pod cost, the other ~10%. Two independent wins that
   happen to sum — the page must not let them read as one.
3. **A config playground built on the Visitor pattern.** Let solution engineers iterate on TTS,
   voice-clone, lip-sync and video-template configs in isolation against client previews. Approval cycle
   3 days → 1 day. This is the LLD story.
4. **The dartboard.** Short, links to the source, honest about the Overpass problem and why the
   architecture works around it rather than pretending the API is reliable.

Attribution: OpenStreetMap contributors credited on the map, per ODbL. Non-negotiable and not fine print.

## Testing

The dart sampler is a pure function and gets real tests:
- every sampled point falls within R of the origin, across a spread of radii and origin latitudes
- distribution is uniform by area — bin 100k samples by radius, assert each annulus holds its expected
  share within tolerance. This test fails if the √ is ever removed.
- antimeridian: origin at lon 179.9 produces valid longitudes in [-180, 180]
- high latitude: origin at lat 89 does not produce NaN or out-of-range latitude

API routes are tested against mocked upstream responses for the shapes actually observed: a village hit,
the `Unable to geocode` body, a 429, and a timeout.

One end-to-end pass with Playwright: load `/dartboard`, stub geolocation, throw, assert a card appears
with a real place name.

## Deployment

`github.com/abilash0045/portfolio`, public. Vercel free tier. The repo is deliberately readable — it is
part of the portfolio.

`~/career-plan` stays entirely out of this repo. It contains private job-search material and must never
appear in public git history.

## Out of scope

No CMS, no blog, no analytics, no contact form, no dark mode toggle, no i18n, no visitor counter on the
dartboard, no saving or sharing of individual throws. Any of these can be added later if there is a
reason; none has one now.
