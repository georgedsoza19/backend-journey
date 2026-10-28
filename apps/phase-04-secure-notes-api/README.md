# Phase 4 — Secure Notes API

Authenticated notes API with JWT access/refresh tokens, ownership checks, admin scope, helmet, CORS, and login rate limiting.

## Skills practiced

- Password hashing (bcrypt)
- JWT access tokens + rotating refresh tokens
- Authn vs authz / RBAC (`USER` vs `ADMIN`)
- IDOR prevention (own notes only, unless admin)
- helmet + CORS + express-rate-limit on `/auth/login`

## Setup

```bash
docker compose up -d postgres
# creates DB if needed:
docker compose exec postgres psql -U postgres -c "CREATE DATABASE secure_notes;"

pnpm install
cp apps/phase-04-secure-notes-api/.env.example apps/phase-04-secure-notes-api/.env
pnpm --filter @backend-journey/phase-04-secure-notes-api db:migrate
pnpm --filter @backend-journey/phase-04-secure-notes-api db:seed
pnpm dev:phase-04-api
```

Port **3004**. Companion UI: `apps/phase-04-secure-notes-web` (`pnpm dev:phase-04-web`).

## Seed accounts

| Email | Password | Role |
|---|---|---|
| alice@example.com | Password123! | USER |
| admin@example.com | Password123! | ADMIN |

## Key routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | no | Creates USER |
| POST | `/auth/login` | no | Rate limited |
| POST | `/auth/refresh` | refresh body | Rotates refresh token |
| POST | `/auth/logout` | refresh body | Revokes refresh |
| GET | `/auth/me` | Bearer | Current user |
| GET | `/notes?scope=mine\|all` | Bearer | `all` requires ADMIN |
| POST/PATCH/DELETE | `/notes`… | Bearer | Ownership enforced |

## Env

See `.env.example` — `JWT_*`, `CORS_ORIGIN`, `DATABASE_URL` (DB `secure_notes` on host port **5433**).
