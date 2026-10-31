# Progress tracker

Tick items as you complete each milestone. Update this file in the same commit as the phase work when possible.

## Phase 0 — Mindset & scaffold

- [x] Monorepo created on GitHub
- [x] Roadmap docs in repo
- [x] Workspace + shared package stubs

## Phase 1 — Server-side JS & TypeScript

- [x] JSON-backed todo CLI
- [x] Raw `http` JSON server
- [x] TypeScript `strict: true`
- [ ] You personally ran CLI + curl against `/todos` and understand the code

## Phase 2 — REST & Express

- [x] TaskBoard in-memory API
- [x] Zod validation + error middleware
- [x] Documented routes / curl examples
- [ ] You personally ran the curl examples and understand the middleware chain

## Phase 3 — Databases & SQL

- [x] Notes API with Prisma + PostgreSQL
- [x] Migrations + seed
- [x] `.env.example` documented
- [ ] You personally queried notes with `?q=` / `?tag=` and opened Prisma Studio

## Phase 4 — Auth & first Next.js UI

- [x] Secure Notes API (JWT, RBAC, ownership)
- [x] Next.js App Router web client + shared UI kit
- [ ] You personally logged in as Alice and Admin and verified ownership / scope=all

## Phase 5 — Testing, logging, caching

- [x] Cached feed API with Redis
- [x] Integration tests + structured logs
- [x] Matching web UI
- [ ] You personally observed X-Cache HIT/MISS and ran the Vitest suite

## Phase 6 — Docker, CI/CD, deploy

- [x] Dockerfiles / Compose for Cached Feed API (`feed` profile)
- [x] GitHub Actions: typecheck + Phase 5 tests + Docker image build
- [x] Staging deploy documented (`docs/DEPLOY.md`)
- [ ] You personally ran `docker compose --profile feed up --build` and/or deployed to a PaaS

## Phase 7 — System design

- [x] Whiteboard notes: `docs/phases/07-system-design.md`
- [x] ForgeBoard design doc: `docs/FORGEBOARD_DESIGN.md`
- [x] Interview prep prompts: `docs/INTERVIEW_PREP.md`
- [ ] You personally redrew ForgeBoard from memory and answered interview prompts out loud

## Capstone — ForgeBoard

- [ ] API complete (`apps/forgeboard-api`)
- [ ] Next.js UI complete (`apps/forgeboard-web`)
- [ ] Tests, OpenAPI, README polish, live demo
