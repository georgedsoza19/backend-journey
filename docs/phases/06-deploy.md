# Phase 6 — Deployment, Docker, CI/CD

## Learn

- 12-factor config (env-based)
- Multi-stage Docker builds for a pnpm monorepo package
- Compose profiles for infra vs full stack
- Liveness (`/health`) vs readiness (`/ready`)
- Migrate-on-boot (`prisma migrate deploy`)
- GitHub Actions: typecheck + tests + image build
- Deploying to a PaaS (Render / Railway / Fly)

## Exercises in this repo

1. `docker compose --profile feed up -d --build`
2. Hit `/health` and `/ready`
3. Read [docs/DEPLOY.md](../DEPLOY.md) and deploy to one free/hobby PaaS (optional but strongly recommended)

## Milestone

A stranger can clone the repo, run Compose with the `feed` profile, and get a healthy API. CI builds the image on `main`.
