# Build from monorepo root:
#   docker build -f apps/forgeboard-api/Dockerfile -t forgeboard-api .
FROM node:22-bookworm-slim AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate \
  && apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /repo

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages ./packages
COPY apps ./apps

RUN pnpm install --frozen-lockfile

WORKDIR /repo/apps/forgeboard-api
RUN pnpm db:generate \
  && pnpm exec tsc -p tsconfig.json \
  && rm -rf dist/generated \
  && cp -R src/generated dist/generated

WORKDIR /repo
RUN pnpm --filter @backend-journey/forgeboard-api deploy --prod /out \
  && rm -rf /out/dist \
  && cp -R apps/forgeboard-api/dist /out/dist \
  && cp -R apps/forgeboard-api/prisma /out/prisma \
  && cp apps/forgeboard-api/docker-entrypoint.sh /out/docker-entrypoint.sh \
  && chmod +x /out/docker-entrypoint.sh

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV PORT=3006
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system nodejs && useradd --system --gid nodejs nodejs

COPY --from=build /out ./
USER nodejs

EXPOSE 3006
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3006)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
