import { z } from "zod";
import { TASK_STATUSES } from "../types/task.js";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
});

export const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    description: z.string().trim().max(2000).nullable().optional(),
    status: z.enum(TASK_STATUSES).optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.description !== undefined ||
      body.status !== undefined,
    { message: "Provide at least one of: title, description, status" },
  );

export const listTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const taskIdParamsSchema = z.object({
  id: z.string().uuid("Task id must be a UUID"),
});
