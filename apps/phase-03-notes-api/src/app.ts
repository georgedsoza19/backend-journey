import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { notesRouter } from "./routes/notes.js";
import { usersRouter } from "./routes/users.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, phase: 3, service: "notes-api" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "Notes API",
      phase: 3,
      docs: "See apps/phase-03-notes-api/README.md",
      endpoints: {
        health: "GET /health",
        users: "GET /users",
        notes: "GET|POST /notes",
        noteById: "GET|PATCH|DELETE /notes/:id",
      },
    });
  });

  app.use("/users", usersRouter);
  app.use("/notes", notesRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
