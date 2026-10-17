import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { addTodo, listTodos, removeTodo, setTodoStatus } from "./store.js";
import type { TodoStatus } from "./types.js";

const port = Number(process.env.PORT ?? 3001);

function sendJson(
  res: ServerResponse,
  statusCode: number,
  body: unknown,
): void {
  if (statusCode === 204) {
    res.writeHead(204);
    res.end();
    return;
  }

  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  if (chunks.length === 0) {
    return null;
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(raw) as unknown;
}

function notFound(res: ServerResponse): void {
  sendJson(res, 404, { error: "Not found" });
}

async function handle(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const { pathname } = url;

  if (method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, phase: 1 });
    return;
  }

  if (method === "GET" && pathname === "/todos") {
    const todos = await listTodos();
    sendJson(res, 200, { data: todos });
    return;
  }

  if (method === "POST" && pathname === "/todos") {
    const body = (await readJsonBody(req)) as { title?: unknown } | null;
    if (!body || typeof body.title !== "string") {
      sendJson(res, 400, { error: "Expected JSON body: { \"title\": string }" });
      return;
    }
    const todo = await addTodo(body.title);
    sendJson(res, 201, { data: todo });
    return;
  }

  const todoMatch = pathname.match(/^\/todos\/([^/]+)(?:\/(done|pending))?$/);
  if (todoMatch) {
    const id = decodeURIComponent(todoMatch[1] ?? "");
    const action = todoMatch[2] as TodoStatus | undefined;

    if (method === "PATCH" && action) {
      const todo = await setTodoStatus(id, action);
      sendJson(res, 200, { data: todo });
      return;
    }

    if (method === "DELETE" && !action) {
      await removeTodo(id);
      sendJson(res, 204, null);
      return;
    }
  }

  notFound(res);
}

const server = createServer((req, res) => {
  handle(req, res).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Internal error";
    const status = message.includes("not found") ? 404 : 400;
    if (!res.headersSent) {
      sendJson(res, status, { error: message });
    } else {
      res.end();
    }
  });
});

server.listen(port, () => {
  console.log(`Phase 1 HTTP server listening on http://localhost:${port}`);
  console.log("Try: GET /health  |  GET /todos  |  POST /todos");
});
