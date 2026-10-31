# Interview prep — backend transition

Practice answering these **out loud** in 2–4 minutes each. Prefer examples from **this repo**.

## Story prompts

1. **Walk me through Phase 4 auth.**  
   Password hashing → JWT access → refresh rotation → ownership vs admin `scope=all`.

2. **Explain cache-aside from Phase 5.**  
   MISS loads DB + SET with TTL; HIT returns Redis; write invalidates keys; `X-Cache` header.

3. **How do you deploy this?**  
   Multi-stage Docker, `prisma migrate deploy` on boot, `/health` vs `/ready`, env-based config (Phase 6).

4. **Design ForgeBoard.**  
   Use [FORGEBOARD_DESIGN.md](./FORGEBOARD_DESIGN.md): requirements → schema → authz → cache → queue → failures.

5. **REST vs GraphQL?**  
   You know REST deeply; GraphQL helps when clients need flexible graphs and over-fetching hurts. ForgeBoard MVP stays REST.

6. **What blocks the Node event loop?**  
   Sync CPU, huge JSON parse, sync fs. Prefer async I/O; offload heavy work to workers.

## Live-coding warmups

- Express route: create resource with Zod validation + centralized error  
- Prisma: 1:N create with nested write; paginated list  
- Middleware: require membership for `workspaceId`  
- Redis: get/set/del with a namespaced key  

## Portfolio pitch (30 seconds)

> “I moved from frontend JS into backend with a phase-based Node/TypeScript monorepo: REST + Postgres/Prisma, JWT auth, Redis caching with tests, Docker/CI, and I’m building ForgeBoard — a multi-tenant issue tracker — as the capstone.”

Link: your GitHub `backend-journey` repo + ForgeBoard README when ready.

## Red flags to avoid

- Storing plaintext passwords or JWTs in logs  
- Trusting client-sent `userId` / `role` without server checks  
- Caching without invalidation story  
- “We’ll just add a microservice” with no boundary reason
