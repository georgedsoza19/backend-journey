# Backend Journey

A phase-wise **Node.js + TypeScript** learning monorepo for frontend JavaScript developers transitioning into backend (and fullstack) roles.

This repository is built **one phase at a time** — each phase is implemented, committed, and pushed when ready. Later apps start as placeholders.

## Stack

- **Backend:** Node.js 22+, TypeScript, Express (Phase 2+), PostgreSQL, Prisma, Zod, Vitest, Redis, Docker, GitHub Actions  
- **Frontend (Phase 4+):** Next.js App Router + Tailwind CSS  
- **Capstone:** ForgeBoard — team issue-tracker API + web UI  

## Progress

| Phase | Status | Package |
|---|---|---|
| 0 Scaffold + docs | Done | `docs/` |
| 1 Foundations (CLI + raw HTTP) | Done | [`apps/phase-01-cli-todo`](apps/phase-01-cli-todo) |
| 2 REST + Express | Done | [`apps/phase-02-taskboard-api`](apps/phase-02-taskboard-api) |
| 3 Databases + SQL | Done | [`apps/phase-03-notes-api`](apps/phase-03-notes-api) |
| 4 Auth + Next.js UI | Upcoming | `phase-04-secure-notes-*` |
| 5 Cache, tests, logs | Upcoming | `phase-05-cached-feed-*` |
| 6 Docker / CI / deploy | Upcoming | tooling |
| 7 System design | Upcoming | `docs/phases/` |
| Capstone ForgeBoard | Upcoming | `forgeboard-*` |

Track details in [docs/PROGRESS.md](docs/PROGRESS.md). Full path: [docs/ROADMAP.md](docs/ROADMAP.md).

## Quick start

Prerequisites: **Node.js 22+** and **pnpm 9+**.

### Phase 1 — CLI + raw HTTP (port 3001)

```bash
pnpm install
pnpm cli:phase-01 add "Learn Node event loop"
pnpm cli:phase-01 list
pnpm dev:phase-01
# curl http://localhost:3001/todos
```

### Phase 2 — TaskBoard Express API (port 3002)

```bash
pnpm install
pnpm dev:phase-02
# curl http://localhost:3002/health
# curl -X POST http://localhost:3002/tasks -H 'Content-Type: application/json' -d '{"title":"Learn Express"}'
```

### Phase 3 — Notes API + Postgres (port 3003)

```bash
docker compose up -d postgres   # host port 5433
pnpm install
cp apps/phase-03-notes-api/.env.example apps/phase-03-notes-api/.env
pnpm --filter @backend-journey/phase-03-notes-api db:migrate:deploy
pnpm db:seed:phase-03
pnpm dev:phase-03
# curl "http://localhost:3003/notes?q=prisma"
```

## Monorepo layout

```text
apps/          # Phase projects + ForgeBoard
packages/      # Shared tsconfig, future UI + API client
docs/          # Roadmap, architecture, progress
docker-compose.yml  # Postgres + Redis (Phase 3+)
```

## How commits work

1. Scaffold / docs  
2. `feat(phase-01): …`  
3. `feat(phase-02): …`  
4. …through ForgeBoard  

Ask for the next phase when you’re ready to continue.

## License

MIT — see [LICENSE](LICENSE).
