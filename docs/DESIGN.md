# Portfolio + Dartboard — Design

Date: 2026-08-05
Owner: S L Abilash
Status: approved, pre-implementation

## What this is

A personal portfolio at `/` and a working dart-throwing wall map at `/dartboard`.

The portfolio exists because the work worth showing runs inside a company and cannot be linked to.
A 25k/day video render pipeline has no public repo, and it never will. So the portfolio's job is to
carry that work in written form, with the numbers and the reasoning attached, credibly enough that a
reader does not need a repo to believe it.

GitHub gets a link and no more. Repo cards would compete with the case studies for attention while
saying less than the case studies do. This repo is the code sample.

The dartboard exists because a portfolio with no personality is forgettable, and because it is a real
piece of engineering: geospatial sampling, a flaky third-party API, and a graceful-degradation problem.
It is the only thing on the site whose source a reader can actually inspect.

## Constraints

- Public and indexed. The site is about the work and nothing else. No employment-status badges, no
  compensation figures, no location-preference statements. Those belong on a profile someone chooses
  to open, not on the front page of a portfolio.
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
  | { kind: "nowhere" }
```

`Unable to geocode` maps to `kind: "nowhere"`. Any other upstream failure surfaces as an error the UI
reports plainly; it does not silently become "nowhere", because a network failure and an empty ocean are
different facts and conflating them would be a lie in the UI.

Note that `nowhere` carries no reason. An earlier draft of this document had it distinguish `water` from
`unmapped`, which is not derivable: Nominatim returns the same `Unable to geocode` body for an ocean
coordinate and for genuinely unmapped land, and there is no second field to separate them. The UI copy
is written to be true in both cases rather than asserting a cause we cannot know.

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

API routes are tested against recorded upstream responses for the shapes actually observed on
2026-08-05: a village hit, the `Unable to geocode` body, a 429, and a timeout.

One end-to-end pass with Playwright: load `/dartboard`, stub geolocation, throw, assert a card appears
with a real place name.

### Recorded responses are not a violation of "nothing mocked"

The application never mocks. It calls the real APIs and handles their real failures, always.

The *test suite* uses recorded real responses, and must. Overpass fails roughly one request in three;
a CI job that called it live would fail one build in three for reasons that have nothing to do with the
commit, and a test suite that cries wolf is worse than no test suite. Fixtures are captured verbatim
from real calls and the file records when.

Upstream drift is caught by a separate scheduled workflow instead — see `contract-check` below. That is
the honest way to get both a green build and a real guarantee.

## Repo and CI/CD

`github.com/abilash0045/portfolio`, public. Public means unlimited free Actions minutes, so build time
is bounded by patience rather than cost.

Unrelated personal repositories that live on the same machine stay entirely out of this one. Only this
project belongs in this project's history.

### Workflows

**`ci.yml`** — on push and pull request. Typecheck, lint, unit tests, `next build`, Playwright e2e, and
a Lighthouse budget check. The full suite runs everywhere; a portfolio's broken deploy is not an
incident, so nothing here is a hard deployment gate. It exists for signal, and for Auto-fix to react to.

**`contract-check.yml`** — scheduled weekly, and manually dispatchable. Calls the live Nominatim and
Overpass endpoints and asserts the response *shapes* the app depends on: that a rural land coordinate
returns a named place, and that an ocean coordinate returns the `Unable to geocode` error body. Opens
an issue on failure rather than failing a build, because upstream being down is not a code defect.
Overpass failures do not open an issue — it is expected to fail and the app already treats it as
optional.

### Deployment

Vercel's native GitHub integration: preview deploy per pull request, production deploy on `main`. Chosen
over a GitHub Actions deploy step because previews-per-PR come free and there is no deploy token to
store or rotate.

This requires connecting Vercel to the GitHub repo once, in a browser. That step is Abilash's; it cannot
be scripted from here.

## Remote development

The goal is being able to work on this from a phone. Two distinct features cover two distinct moments,
and both get set up.

**Cloud sessions** (`claude --cloud`, claude.ai/code, Claude mobile app) run on an Anthropic-managed VM.
The laptop can be closed. This is the one that means "develop from my phone."

**Remote Control** (`claude remote-control`) exposes a session running on the Mac to phone and browser.
The laptop must stay awake and the process alive. This is for steering something already started at the
desk, not for working away from it.

### Repo config, because user-level config does not travel

Cloud sessions clone the repo and get nothing else. The repo's `CLAUDE.md`, `.claude/settings.json`,
`.claude/skills/`, `.claude/agents/`, and `.claude/commands/` all come along. `~/.claude/CLAUDE.md` does
not.

That matters here specifically: the anti-slop voice spec and the minimal-code decision ladder live in
the user-level file. Without action, Claude-on-the-phone writes in a different voice than Claude-at-the-
desk on the same repo. So the repo gets its own `CLAUDE.md` carrying the rules this project actually
needs — voice, the minimal-code ladder, and the project's own constraints from this document.

A `SessionStart` hook in `.claude/settings.json` runs `npm install` in cloud sessions, gated on
`CLAUDE_CODE_REMOTE` so it is a no-op locally.

### Cloud environment network access

The default **Trusted** network level allowlists package registries, GitHub, and cloud SDKs. It does
**not** include any domain this project depends on. A cloud environment for this repo must use
**Custom**, with "also include the default list" checked, plus:

```
nominatim.openstreetmap.org
overpass-api.de
tile.openstreetmap.org
basemaps.cartocdn.com
*.basemaps.cartocdn.com
cdn.playwright.dev
```

Without these, live API checks and Playwright browser installs fail inside cloud sessions. Configured in
the environment selector at claude.ai/code — a browser step, and Abilash's to do.

### GitHub access and Auto-fix

`gh` is already authenticated locally with `repo` and `workflow` scopes, so `/web-setup` syncs that token
and cloud sessions work immediately.

Auto-fix additionally requires the Claude GitHub App installed on the repo. It is the piece that makes
the mobile loop close: push from the phone, CI fails, Claude investigates and pushes a fix without a
laptop being opened. Enabled per PR.

One consequence worth stating plainly: Auto-fix can reply to review comment threads using the connected
GitHub account, so replies appear under Abilash's username, labelled as written by Claude Code. On a
solo portfolio repo with no comment-triggered automation, that surface is harmless. It would not be on a
repo where a PR comment can deploy something.

## Out of scope

No CMS, no blog, no analytics, no contact form, no dark mode toggle, no i18n, no visitor counter on the
dartboard, no saving or sharing of individual throws. Any of these can be added later if there is a
reason; none has one now.
