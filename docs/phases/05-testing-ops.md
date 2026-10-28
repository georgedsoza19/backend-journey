# Phase 5 — Testing, logging, caching

**Apps:** `phase-05-cached-feed-api` + `phase-05-cached-feed-web`

## Learn

- Vitest + Supertest integration tests
- pino / pino-http with request IDs and redaction
- Redis cache-aside, TTL, invalidation on write
- Distinguishing public cached reads from authenticated writes

## Milestone

Explain a cache HIT vs MISS, show logs for a request, and run `pnpm --filter @backend-journey/phase-05-cached-feed-api test` green.
