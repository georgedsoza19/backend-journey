# ForgeBoard API (capstone)

Multi-tenant issue tracker backend: Express + Prisma + Postgres + Redis + JWT.

Design: [docs/FORGEBOARD_DESIGN.md](../../docs/FORGEBOARD_DESIGN.md)

## Run locally

```bash
# From repo root — Postgres on 5433 + Redis
docker compose up -d

# Create DB if volume predates forgeboard init script
docker compose exec postgres psql -U postgres -c "CREATE DATABASE forgeboard;"

pnpm --filter @backend-journey/forgeboard-api db:generate
pnpm --filter @backend-journey/forgeboard-api db:migrate:deploy
pnpm --filter @backend-journey/forgeboard-api db:seed
pnpm --filter @backend-journey/forgeboard-api dev
```

API: `http://localhost:3006` · OpenAPI: `/docs` · Seed users: `alice@forgeboard.dev` / `bob@forgeboard.dev` — `Password123!`

## Tests

```bash
pnpm --filter @backend-journey/forgeboard-api test
```

## Docker

```bash
docker compose --profile forgeboard up -d --build
curl http://localhost:3006/health
curl http://localhost:3006/ready
```

## Main routes

| Method | Path | Notes |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` | JWT session |
| GET | `/auth/me` | Current user |
| GET/POST | `/workspaces` | Membership-scoped |
| GET/POST | `/workspaces/:id/projects` | Projects in workspace |
| GET/POST | `/projects/:id/issues` | List (Redis cache-aside) / create |
| GET/PATCH | `/issues/:id` | Detail + status updates |
| POST | `/issues/:id/comments` | Comments |
