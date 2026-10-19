import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { tasksRouter } from "./routes/tasks.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, phase: 2, service: "taskboard-api" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "TaskBoard API",
      phase: 2,
      docs: "See apps/phase-02-taskboard-api/README.md",
      endpoints: {
        health: "GET /health",
        tasks: "GET|POST /tasks",
        taskById: "GET|PATCH|DELETE /tasks/:id",
      },
    });
  });

  app.use("/tasks", tasksRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
