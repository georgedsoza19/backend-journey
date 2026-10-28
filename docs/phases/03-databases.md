# Phase 3 — Databases & SQL

**Time:** 4–5 weeks @ 12–15 hrs/week  
**App:** `apps/phase-03-notes-api`

## Learn

- Relational modeling: PKs, FKs, 1:N, N:M, indexes
- PostgreSQL locally via Docker Compose (host port **5433**)
- Prisma schema, migrate, client, seed
- Title search and join-based tag filters

## Resources

- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [SQLBolt](https://sqlbolt.com/)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)

## Exercises in this repo

1. Inspect `prisma/schema.prisma` and the `init` migration SQL
2. Seed users/notes/tags; query with `?q=` and `?tag=`
3. Create a note with new tags and confirm join rows in Prisma Studio

## Milestone

You can design a normalized schema, run migrations, and query with filters — without committing secrets (`.env` stays local).
