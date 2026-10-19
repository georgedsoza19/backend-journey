import { randomUUID } from "node:crypto";
import { NotFoundError } from "../lib/errors.js";
import type { Task, TaskStatus } from "../types/task.js";

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
}

export interface ListTasksQuery {
  status?: TaskStatus;
  page: number;
  limit: number;
}

const tasks = new Map<string, Task>();

function nowIso(): string {
  return new Date().toISOString();
}

export function listTasks(query: ListTasksQuery): {
  data: Task[];
  meta: { page: number; limit: number; total: number; totalPages: number };
} {
  let items = [...tasks.values()];

  if (query.status) {
    items = items.filter((task) => task.status === query.status);
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / query.limit));
  const start = (query.page - 1) * query.limit;
  const data = items.slice(start, start + query.limit);

  return {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
    },
  };
}

export function getTask(id: string): Task {
  const task = tasks.get(id);
  if (!task) {
    throw new NotFoundError(`Task not found: ${id}`);
  }
  return task;
}

export function createTask(input: CreateTaskInput): Task {
  const timestamp = nowIso();
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? null,
    status: input.status ?? "todo",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  tasks.set(task.id, task);
  return task;
}

export function updateTask(id: string, input: UpdateTaskInput): Task {
  const existing = getTask(id);
  const updated: Task = {
    ...existing,
    title: input.title ?? existing.title,
    description:
      input.description === undefined ? existing.description : input.description,
    status: input.status ?? existing.status,
    updatedAt: nowIso(),
  };
  tasks.set(id, updated);
  return updated;
}

export function deleteTask(id: string): void {
  if (!tasks.delete(id)) {
    throw new NotFoundError(`Task not found: ${id}`);
  }
}

/** Test helper — clears in-memory state. */
export function resetStore(): void {
  tasks.clear();
}
