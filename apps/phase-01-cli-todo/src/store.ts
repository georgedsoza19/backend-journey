import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Todo, TodoStatus, TodoStore } from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "todos.json");

async function ensureStore(): Promise<TodoStore> {
  await mkdir(dataDir, { recursive: true });

  try {
    const raw = await readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw) as TodoStore;
    if (!Array.isArray(parsed.todos)) {
      return { todos: [] };
    }
    return parsed;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      const empty: TodoStore = { todos: [] };
      await writeFile(dataFile, JSON.stringify(empty, null, 2), "utf8");
      return empty;
    }
    throw error;
  }
}

async function saveStore(store: TodoStore): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export async function listTodos(): Promise<Todo[]> {
  const store = await ensureStore();
  return store.todos;
}

export async function addTodo(title: string): Promise<Todo> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Title is required");
  }

  const store = await ensureStore();
  const now = new Date().toISOString();
  const todo: Todo = {
    id: randomUUID(),
    title: trimmed,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  store.todos.push(todo);
  await saveStore(store);
  return todo;
}

export async function setTodoStatus(
  id: string,
  status: TodoStatus,
): Promise<Todo> {
  const store = await ensureStore();
  const todo = store.todos.find((item) => item.id === id);
  if (!todo) {
    throw new Error(`Todo not found: ${id}`);
  }

  todo.status = status;
  todo.updatedAt = new Date().toISOString();
  await saveStore(store);
  return todo;
}

export async function removeTodo(id: string): Promise<void> {
  const store = await ensureStore();
  const next = store.todos.filter((item) => item.id !== id);
  if (next.length === store.todos.length) {
    throw new Error(`Todo not found: ${id}`);
  }
  store.todos = next;
  await saveStore(store);
}
