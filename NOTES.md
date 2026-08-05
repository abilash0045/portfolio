# Notes

Running log for this repo. Decisions, progress, and things worth remembering.
The design lives in `docs/DESIGN.md` and is the reference; this file is the diary.

## Decisions

**2026-08-05 — Written case studies carry the work, not repo cards.**
The systems worth showing run inside a company and have no public repos. Case studies with the
numbers and the reasoning attached do more work than a wall of repo cards, which would compete for
attention while saying less. GitHub gets a footer link, and this repo is the code sample.

**2026-08-05 — The site is about the work, nothing else.**
Public and indexed, so it carries no employment-status badge, no compensation figures, and no
location-preference statement. Those belong on a profile someone chooses to open, not on the front
page of a portfolio. The work is the argument.

**2026-08-05 — Employer detail capped at resume level.**
Numbers, tech, and narrative are already public on the resume and LinkedIn, so restating them adds no
exposure. No internal service names, client names, or real architecture diagrams of Whilter's system.

**2026-08-05 — Overpass is off the critical path.**
Measured before designing: three identical sequential queries returned 504 / 200-at-10.5s / 429, and
both public mirrors timed out at 45s. Nominatim over the same period: three calls, all 200, all under a
second. So Nominatim carries the throw and Overpass is optional enrichment that may never arrive.
Discovering this by measurement rather than by assuming is the reason the architecture works.

**2026-08-05 — Ocean throws are shown honestly, not re-rolled.**
Auto-re-rolling until the dart hits land biases the distribution toward coasts while still calling
itself random. The dead ocean throw is the joke, and re-throwing is one click.

**2026-08-05 — Nominatim is not CORS-blocked.**
Initially assumed a server proxy was required because the browser couldn't call it. It sends
`access-control-allow-origin: *`, so that was wrong. The API route stays, for response caching and
rate-limit control — a correct reason rather than an imagined one.

**2026-08-05 — Cloud sessions, not Remote Control, are what "develop from mobile" needs.**
Two different features. Cloud sessions run on Anthropic's VM and survive a closed laptop. Remote Control
exposes a session running on the Mac and dies with it. Both are set up; they cover different moments.

**2026-08-05 — The repo needs its own CLAUDE.md.**
User-level `~/.claude/CLAUDE.md` does not travel to cloud sessions — only repo-committed config does.
Without a repo CLAUDE.md, Claude working from the phone has none of the voice or code rules that
Claude at the desk has, on the same repo.

**2026-08-05 — Default cloud network access blocks this project's APIs.**
Trusted allowlists npm and GitHub, not `nominatim.openstreetmap.org`, `overpass-api.de`, the tile hosts,
or Playwright's CDN. The cloud environment needs Custom access with those added or nothing live works
from mobile.

**2026-08-05 — Tests use recorded responses; the app never mocks.**
Overpass fails about one call in three. CI that called it live would fail one build in three for reasons
unrelated to the commit. Fixtures are captured verbatim from real calls; a weekly `contract-check`
workflow hits the live APIs and opens an issue if the response shape drifts. Both a green build and a
real guarantee, without pretending.

**2026-08-05 — Full CI suite, no hard deploy gates.**
Abilash's call: it's a portfolio, a broken deploy isn't an incident. Everything runs for the signal;
nothing blocks. Auto-fix reacts to failures, which is what makes the phone loop close.

## Progress

- [x] 2026-08-05 — API behaviour measured (Nominatim, Overpass, both tile sources)
- [x] 2026-08-05 — Design approved and written to `docs/DESIGN.md`
- [x] 2026-08-05 — CI/CD and remote-development requirements added to the design
- [ ] Implementation plan
- [ ] Scaffold + dart sampler with tests
- [ ] API routes
- [ ] Dartboard UI
- [ ] Portfolio content
- [ ] CI workflows + Vercel
- [ ] Deploy

## Manual steps (browser only — cannot be scripted)

- [ ] Connect Vercel to the GitHub repo (preview per PR, production on `main`)
- [ ] Install the Claude GitHub App on the repo (required for Auto-fix)
- [ ] Create the cloud environment at claude.ai/code with Custom network access and the domains listed
      in `docs/DESIGN.md`
