# Phase 1 — Server-side JavaScript & TypeScript

Learn Node.js on the server without a framework: typed TypeScript, async file I/O, a JSON-backed CLI, and a raw `http` JSON API.

## Skills practiced

- Node.js ESM modules, `fs/promises`, env vars (`PORT`)
- TypeScript `strict` mode with `tsx`
- Async error handling
- Building JSON over HTTP with the built-in `http` module (no Express yet)

## Run

From the monorepo root:

```bash
pnpm install
pnpm cli:phase-01 help
pnpm cli:phase-01 add "Learn the event loop"
pnpm cli:phase-01 list
pnpm dev:phase-01
```

HTTP examples (server on port `3001` by default):

```bash
curl http://localhost:3001/health
curl http://localhost:3001/todos
curl -X POST http://localhost:3001/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship Phase 1"}'
```

## Milestone checklist

- [x] CLI reads/writes `data/todos.json`
- [x] Raw HTTP server serves JSON for todos
- [x] Project uses TypeScript with `strict: true`

## Resources

- [Node.js Learn](https://nodejs.org/learn)
- [TypeScript for JS Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
