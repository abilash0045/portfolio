# Recorded fixtures

Captured verbatim from live APIs on 2026-08-05. Not hand-written, not edited.

These exist so CI is deterministic. Overpass fails roughly one request in three,
so a test suite calling it live would fail about one build in three for reasons
that have nothing to do with the commit.

Drift against the live APIs is caught by `contract/live-api.test.ts`, run weekly
by `.github/workflows/contract-check.yml`.
