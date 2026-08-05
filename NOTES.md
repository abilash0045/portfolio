# Notes

Running log for this repo. Decisions, progress, and things worth remembering.
The design lives in `docs/DESIGN.md` and is the reference; this file is the diary.

## Decisions

**2026-08-05 — Portfolio carries the work, GitHub doesn't.**
The public GitHub is 32 repos, mostly forks and 2023 college projects. Embedding repo cards would
actively hurt. GitHub gets a footer link; this repo itself is the code sample.

**2026-08-05 — No job-search signal on the page.**
Site is public and indexed, and the LinkedIn strategy is deliberately soft-signal while employed.
No "open to work", no comp figures, no relocation intent.

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

## Progress

- [x] 2026-08-05 — API behaviour measured (Nominatim, Overpass, both tile sources)
- [x] 2026-08-05 — Design approved and written to `docs/DESIGN.md`
- [ ] Implementation plan
- [ ] Scaffold + dart sampler with tests
- [ ] API routes
- [ ] Dartboard UI
- [ ] Portfolio content
- [ ] Deploy
