# Architecture

## Monorepo

```text
backend-journey/
├── apps/           # One package per learning phase (+ ForgeBoard)
├── packages/       # Shared tsconfig, future UI + API client
├── docs/           # Roadmap, progress, phase notes
└── docker-compose.yml  # Postgres + Redis from Phase 3+
```

## Frontend ↔ backend (from Phase 4)

- **Express (or raw Node) apps** own business logic, auth, persistence, and OpenAPI.
- **Next.js App Router** apps are UI clients. They call APIs over HTTP.
- Shared look-and-feel lives in `@backend-journey/ui`.
- Typed fetch helpers live in `@backend-journey/api-client`.

This separation is intentional: you practice real backend skills (CORS, tokens, deployment) instead of burying everything in Next.js Route Handlers.

## Local ports (conventions)

| Service | Port |
|---|---|
| Phase 1 HTTP | 3001 |
| Phase 2 TaskBoard API | 3002 |
| Phase 3+ APIs | 3003+ (documented per app) |
| Next.js web apps | 3000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
