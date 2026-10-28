# Deployment guide (Phase 6)

This repo is set up so the **Cached Feed API** (Phase 5) is the first service you can containerize and deploy. Treat it as the template for ForgeBoard later.

## Local one-command stack

```bash
# Infra only
docker compose up -d

# API + Postgres + Redis
docker compose --profile feed up -d --build

curl http://localhost:3005/health
curl http://localhost:3005/ready
curl http://localhost:3005/feed
```

If Postgres was created **before** `docker/postgres/init-databases.sql` existed, create DBs once:

```bash
docker compose exec postgres psql -U postgres -c "CREATE DATABASE cached_feed;"
docker compose exec postgres psql -U postgres -c "CREATE DATABASE secure_notes;"
```

Stop:

```bash
docker compose --profile feed down
```

## 12-factor checklist (this API)

| Factor | How we handle it |
|---|---|
| Config via env | `.env.example` / Compose `environment` / PaaS env vars |
| Backing services | Postgres + Redis URLs, not hard-coded hosts in app code |
| Build vs run | Multi-stage Dockerfile; `prisma migrate deploy` on start |
| Logs | Structured JSON via pino (set `LOG_LEVEL`) |
| Disposability | `/health` liveness + `/ready` readiness |
| Port binding | `PORT` env (default 3005) |

## Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string |
| `REDIS_URL` | yes | Redis connection string |
| `JWT_ACCESS_SECRET` | yes | Long random string (≥32 chars) |
| `JWT_REFRESH_SECRET` | yes | Different long random string |
| `CORS_ORIGIN` | yes in prod | Your web origin, e.g. `https://app.example.com` |
| `PORT` | no | Default `3005` |
| `NODE_ENV` | no | Use `production` in deploy |
| `FEED_CACHE_TTL_SECONDS` | no | Default `30` |
| `LOG_LEVEL` | no | `info` / `warn` / `error` |

Never commit real secrets. Rotate JWT secrets if leaked.

## GitHub Actions CI

On every push/PR to `main`:

1. Typecheck all implemented phase packages  
2. Run Phase 5 integration tests (Postgres + Redis service containers)  
3. Build the Cached Feed API Docker image (no push by default)

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Deploy to a PaaS (pick one)

You still create the project in the provider UI and paste env vars. Migrations run automatically via the container entrypoint (`prisma migrate deploy`).

### Option A — Render

1. Create a **Web Service** from this GitHub repo.  
2. Dockerfile path: `apps/phase-05-cached-feed-api/Dockerfile`  
3. Docker build context: repository root  
4. Add managed **PostgreSQL** + **Redis** (or Redis Cloud).  
5. Set env vars from the table above (`DATABASE_URL`, `REDIS_URL`, JWT secrets, `CORS_ORIGIN`).  
6. Health check path: `/ready`  
7. Deploy → open `https://<service>.onrender.com/health`

### Option B — Railway

1. New project → Deploy from GitHub.  
2. Add Postgres + Redis plugins.  
3. Set the service to build with the Dockerfile above (context = repo root).  
4. Copy connection URLs into env vars.  
5. Expose port `3005` (or set `PORT` to Railway’s `$PORT` if required).

### Option C — Fly.io

```bash
fly launch --dockerfile apps/phase-05-cached-feed-api/Dockerfile
fly postgres create   # or attach existing
# provision Redis (Upstash / Fly Redis)
fly secrets set DATABASE_URL=... REDIS_URL=... JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... CORS_ORIGIN=...
fly deploy
```

## Web UI

The Next.js apps (`phase-04` / `phase-05` web) deploy separately (Vercel/Render static). Point `NEXT_PUBLIC_API_URL` at your API’s public HTTPS URL.

## Staging verification checklist

- [ ] `GET /health` → 200  
- [ ] `GET /ready` → 200 with postgres/redis `ok`  
- [ ] `GET /feed` → 200 (twice; second may be cache HIT)  
- [ ] Login + publish from web or curl still works  
- [ ] CI green on `main`
