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
