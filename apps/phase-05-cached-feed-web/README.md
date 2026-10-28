# Phase 5 — Cached Feed Web

Next.js App Router UI:

- `/` — public feed (shows cache HIT/MISS)
- `/studio` — login + create/publish posts (invalidates Redis cache)

```bash
pnpm dev:phase-05-api   # :3005
pnpm dev:phase-05-web   # :3000
```
