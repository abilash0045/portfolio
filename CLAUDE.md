# Portfolio: working rules

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

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes: APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev`; verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
