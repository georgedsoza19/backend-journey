import type { Request, Response } from "express";
import type { z } from "zod";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../schemas/taskSchemas.js";
import * as taskStore from "../store/taskStore.js";

type CreateBody = z.infer<typeof createTaskSchema>;
type UpdateBody = z.infer<typeof updateTaskSchema>;
type ListQuery = z.infer<typeof listTasksQuerySchema>;
type IdParams = z.infer<typeof taskIdParamsSchema>;

export function listTasks(req: Request, res: Response): void {
  const query = req.query as unknown as ListQuery;
  const result = taskStore.listTasks(query);
  res.status(200).json(result);
}

export function getTask(req: Request, res: Response): void {
  const { id } = req.params as unknown as IdParams;
  const task = taskStore.getTask(id);
  res.status(200).json({ data: task });
}

export function createTask(req: Request, res: Response): void {
  const body = req.body as CreateBody;
  const task = taskStore.createTask(body);
  res.status(201).json({ data: task });
}

export function updateTask(req: Request, res: Response): void {
  const { id } = req.params as unknown as IdParams;
  const body = req.body as UpdateBody;
  const task = taskStore.updateTask(id, body);
  res.status(200).json({ data: task });
}

export function deleteTask(req: Request, res: Response): void {
  const { id } = req.params as unknown as IdParams;
  taskStore.deleteTask(id);
  res.status(204).send();
}
