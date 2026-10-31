# Backend Journey Roadmap

Full learning path for a JavaScript frontend developer moving into Node.js + TypeScript backends.

**Pace:** 12–15 hrs/week → about 6–8 months to job-ready.  
**Repo model:** Phase-wise commits in this monorepo — not one big-bang build.

## Stack

Node.js 22+, TypeScript, Express (from Phase 2), PostgreSQL, Prisma, Zod, Vitest, Redis, Docker, GitHub Actions, Next.js App Router + Tailwind (from Phase 4), ForgeBoard capstone.

## Phases

| Phase | Focus | App(s) |
|---|---|---|
| 0 | Mindset + scaffold | docs + workspace |
| 1 | Server JS & TS | `phase-01-cli-todo` |
| 2 | HTTP, REST, Express | `phase-02-taskboard-api` |
| 3 | Databases & SQL | `phase-03-notes-api` |
| 4 | Auth + first UI | `phase-04-secure-notes-api` + `web` |
| 5 | Tests, logs, cache | `phase-05-cached-feed-api` + `web` |
| 6 | Docker, CI/CD, deploy | tooling across apps |
| 7 | System design | `docs/phases/07-system-design.md`, `FORGEBOARD_DESIGN.md`, `INTERVIEW_PREP.md` |
| Capstone | ForgeBoard | `forgeboard-api` + `forgeboard-web` |

Phase 7 is **design + interview practice**, not a new runnable app. Capstone implements the design.

## Project sequence

1. **TaskBoard API** (in-memory) — Phase 2  
2. **Notes API** (Postgres) — Phase 3  
3. **Secure Notes** (JWT + Next UI) — Phase 4  
4. **Cached Feed** (Redis + tests) — Phase 5  
5. **ForgeBoard** — capstone  

## Job-ready bar

You can design REST APIs, model Postgres data, implement authz safely, validate/log/test, Dockerize + CI, and explain basic caching/scaling — with ForgeBoard as the portfolio centerpiece.

See phase files under `docs/phases/` and tick `docs/PROGRESS.md` as you go.
