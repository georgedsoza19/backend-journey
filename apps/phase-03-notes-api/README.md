# Phase 3 — Notes API (PostgreSQL + Prisma)

Persist notes with authors and tags. Introduces relational modeling, migrations, seeds, and Prisma Client — still no auth (that’s Phase 4).

## Skills practiced

- PostgreSQL via Docker Compose
- Prisma schema, migrations, seed scripts
- 1:N (`User` → `Note`) and N:M (`Note` ↔ `Tag` via `NoteTag`)
- Title search (`?q=`), tag filter, pagination
- Mapping Prisma errors (`P2002`, `P2025`) to HTTP responses

## Prerequisites

```bash
# From monorepo root — start Postgres
docker compose up -d postgres
```

## Setup

```bash
pnpm install
cp apps/phase-03-notes-api/.env.example apps/phase-03-notes-api/.env
pnpm --filter @backend-journey/phase-03-notes-api db:migrate
pnpm --filter @backend-journey/phase-03-notes-api db:seed
pnpm dev:phase-03
```

`db:migrate` runs `prisma migrate dev` (creates/applies migrations + generates client).  
Default port: **3003**.

## Environment

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection | `postgresql://postgres:postgres@localhost:5433/backend_journey?schema=public` |
| `PORT` | HTTP port | `3003` |
| `NODE_ENV` | runtime mode | `development` |

Never commit `.env` — only `.env.example`.

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness |
| `GET` | `/users` | Seeded users (use `id` as `authorId`) |
| `GET` | `/notes` | List (`?q=&tag=&authorId=&page=&limit=`) |
| `POST` | `/notes` | Create note with optional `tags[]` |
| `GET` | `/notes/:id` | Get one |
| `PATCH` | `/notes/:id` | Update title/body/tags |
| `DELETE` | `/notes/:id` | Delete |

### curl examples

```bash
# List seeded users
curl http://localhost:3003/users

# Search by title
curl "http://localhost:3003/notes?q=prisma"

# Filter by tag
curl "http://localhost:3003/notes?tag=sql"

# Create (replace AUTHOR_ID from /users)
curl -X POST http://localhost:3003/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Soft deletes later","body":"Phase 4 adds auth","authorId":"AUTHOR_ID","tags":["backend","learning"]}'
```

## Data model

```text
User 1──* Note *──* Tag
              └── NoteTag (join)
```

## Milestone checklist

- [x] Prisma schema with User, Note, Tag, NoteTag
- [x] Migration + seed
- [x] CRUD notes with search and tag filter
- [x] `.env.example` documented
- [ ] You inspected tables with `pnpm --filter @backend-journey/phase-03-notes-api db:studio`

## Resources

- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQLBolt](https://sqlbolt.com/)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
