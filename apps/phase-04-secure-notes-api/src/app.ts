import cors from "cors";
import express from "express";
import helmet from "helmet";
import { getConfig } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { notesRouter } from "./routes/notes.js";

export function createApp() {
  const config = getConfig();
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, phase: 4, service: "secure-notes-api" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "Secure Notes API",
      phase: 4,
      docs: "See apps/phase-04-secure-notes-api/README.md",
      endpoints: {
        health: "GET /health",
        auth: "POST /auth/register|login|refresh|logout  GET /auth/me",
        notes: "CRUD /notes (Bearer JWT)",
      },
    });
  });

  app.use("/auth", authRouter);
  app.use("/notes", notesRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
