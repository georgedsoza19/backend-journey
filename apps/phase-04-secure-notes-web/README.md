# Phase 4 — Secure Notes Web

Next.js App Router client for the Secure Notes API. Uses shared `@backend-journey/ui` and `@backend-journey/api-client`.

## Run

```bash
# API must be running on :3004
pnpm install
cp apps/phase-04-secure-notes-web/.env.example apps/phase-04-secure-notes-web/.env.local
pnpm dev:phase-04-web
```

Open http://localhost:3000 — login with seed user `alice@example.com` / `Password123!`.

## Features

- Register / login / logout
- List, create, edit, delete own notes
- Admin can toggle scope `mine` ↔ `all`
- Access token in `Authorization` header; refresh on 401
