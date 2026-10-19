# Phase 2 — TaskBoard API (Express + Zod)

In-memory REST API for tasks. Introduces Express routing, Zod validation, and centralized error responses — still no database.

## Skills practiced

- HTTP status codes and REST resource design
- Express routers, controllers, middleware
- Zod schemas for body / query / params
- Consistent `{ error: { code, message, details? } }` JSON
- Pagination (`page`, `limit`) and filtering (`status`)

## Run

From the monorepo root:

```bash
pnpm install
pnpm dev:phase-02
```

Default port: **3002** (`PORT` env overrides).

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness |
| `GET` | `/tasks` | List (`?status=todo\|in_progress\|done&page=1&limit=10`) |
| `POST` | `/tasks` | Create `{ "title": "...", "description?": "...", "status?": "todo" }` |
| `GET` | `/tasks/:id` | Get one |
| `PATCH` | `/tasks/:id` | Update fields |
| `DELETE` | `/tasks/:id` | Delete |

### curl examples

```bash
curl http://localhost:3002/health

curl -X POST http://localhost:3002/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Write Express routes","status":"todo"}'

curl "http://localhost:3002/tasks?status=todo&page=1&limit=5"

curl -X PATCH http://localhost:3002/tasks/<id> \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

curl -X DELETE http://localhost:3002/tasks/<id>
```

Invalid body example (expect `400` + validation details):

```bash
curl -X POST http://localhost:3002/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":""}'
```

## Folder layout

```text
src/
  app.ts / server.ts
  controllers/
  middleware/     # validate + errorHandler
  routes/
  schemas/        # Zod
  store/          # in-memory Map
  types/
  lib/errors.ts
```

## Milestone checklist

- [x] CRUD `/tasks` with Express
- [x] Zod validation middleware
- [x] Central `AppError` + error handler
- [x] Status filter + pagination
- [ ] You ran the curl examples and can explain each status code

## Resources

- [Express routing](https://expressjs.com/en/guide/routing.html)
- [Express middleware](https://expressjs.com/en/guide/using-middleware.html)
- [Express error handling](https://expressjs.com/en/guide/error-handling.html)
- [Zod](https://zod.dev/)
- [MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
