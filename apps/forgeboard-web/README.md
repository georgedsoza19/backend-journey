# ForgeBoard Web (capstone)

Next.js App Router UI for ForgeBoard.

Design: [docs/FORGEBOARD_DESIGN.md](../../docs/FORGEBOARD_DESIGN.md)  
API: [../forgeboard-api/README.md](../forgeboard-api/README.md)  
Shared UI: `@backend-journey/ui`

## Run locally

```bash
# Terminal 1 — API (see forgeboard-api README)
pnpm --filter @backend-journey/forgeboard-api dev

# Terminal 2 — Web
cp apps/forgeboard-web/.env.example apps/forgeboard-web/.env.local  # if needed
pnpm --filter @backend-journey/forgeboard-web dev
```

Open `http://localhost:3000` · Seed login: `alice@forgeboard.dev` / `Password123!`

`NEXT_PUBLIC_API_URL` defaults to `http://localhost:3006`.

## Screens

- `/login` — JWT login
- `/workspaces` — workspaces + projects
- `/projects/[id]` — issue list (shows Redis HIT/MISS) + create
- `/issues/[id]` — status transitions + comments
