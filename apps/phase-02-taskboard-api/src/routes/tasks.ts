import { Router } from "express";
import * as taskController from "../controllers/taskController.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskSchema,
  listTasksQuerySchema,
  taskIdParamsSchema,
  updateTaskSchema,
} from "../schemas/taskSchemas.js";

export const tasksRouter = Router();

tasksRouter.get(
  "/",
  validate(listTasksQuerySchema, "query"),
  taskController.listTasks,
);

tasksRouter.post(
  "/",
  validate(createTaskSchema, "body"),
  taskController.createTask,
);

tasksRouter.get(
  "/:id",
  validate(taskIdParamsSchema, "params"),
  taskController.getTask,
);

tasksRouter.patch(
  "/:id",
  validate(taskIdParamsSchema, "params"),
  validate(updateTaskSchema, "body"),
  taskController.updateTask,
);

tasksRouter.delete(
  "/:id",
  validate(taskIdParamsSchema, "params"),
  taskController.deleteTask,
);
