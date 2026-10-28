# Phase 5 — Cached Feed API

Public published feed with **Redis cache-aside**, **pino** request logging, and **Vitest + Supertest** integration tests.

## Skills practiced

- Cache-aside + TTL + invalidation on write
- Structured logs with request IDs (secrets redacted)
- Integration tests against real Postgres + Redis
- Auth-protected `/posts` vs public `/feed`

## Setup

```bash
docker compose up -d postgres redis
docker compose exec postgres psql -U postgres -c "CREATE DATABASE cached_feed;"  # once

pnpm install
cp apps/phase-05-cached-feed-api/.env.example apps/phase-05-cached-feed-api/.env
pnpm --filter @backend-journey/phase-05-cached-feed-api db:migrate
pnpm --filter @backend-journey/phase-05-cached-feed-api db:seed
pnpm dev:phase-05-api
```

Port **3005**. Web UI: `pnpm dev:phase-05-web`.

## Seed

`writer@example.com` / `Password123!` — one published post + one draft.

## Key routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/feed` | no | Redis-cached; `X-Cache: HIT\|MISS` |
| POST | `/auth/register\|login` | no | Returns access JWT |
| GET/POST/PATCH/DELETE | `/posts` | Bearer | Own posts; publish invalidates cache |

## Tests

```bash
pnpm --filter @backend-journey/phase-05-cached-feed-api test
```

Requires Postgres (`cached_feed`) + Redis running with values from `.env`.

## Docker (Phase 6)

From monorepo root:

```bash
pnpm docker:feed:up
curl http://localhost:3005/ready
```

- Liveness: `GET /health`
- Readiness: `GET /ready` (Postgres + Redis)
- Image entrypoint runs `prisma migrate deploy` then `node dist/server.js`

See [docs/DEPLOY.md](../../docs/DEPLOY.md).
