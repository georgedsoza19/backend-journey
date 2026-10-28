import { randomUUID } from "node:crypto";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { getConfig } from "./config.js";
import { createLogger } from "./lib/logger.js";
import { requireAuth } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { validate } from "./middleware/validate.js";
import {
  createPostSchema,
  feedQuerySchema,
  loginSchema,
  registerSchema,
  updatePostSchema,
  uuidParamSchema,
} from "./schemas.js";
import * as authService from "./services/authService.js";
import * as feedService from "./services/feedService.js";
import { UnauthorizedError } from "./lib/errors.js";

export function createApp(logger = createLogger()) {
  const config = getConfig();
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(express.json());

  const httpLogger = pinoHttp({
    logger,
    genReqId: (req, res) => {
      const existing = req.headers["x-request-id"];
      const id =
        typeof existing === "string" && existing.length > 0
          ? existing
          : randomUUID();
      res.setHeader("x-request-id", id);
      return id;
    },
    customProps: (req) => ({
      requestId: req.id,
    }),
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url,
        };
      },
    },
  });
  app.use(httpLogger as unknown as RequestHandler);

  app.use((req: Request, _res: Response, next: NextFunction) => {
    // Ensure request id is available on Express req for downstream handlers
    if (!req.id && req.headers["x-request-id"]) {
      req.id = String(req.headers["x-request-id"]);
    }
    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, phase: 5, service: "cached-feed-api" });
  });

  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "Cached Feed API",
      phase: 5,
      endpoints: {
        health: "GET /health",
        feed: "GET /feed (public, Redis-cached)",
        auth: "POST /auth/register|login",
        posts: "CRUD /posts (Bearer JWT)",
      },
    });
  });

  app.get("/feed", validate(feedQuerySchema, "query"), (req, res, next) => {
    const query = req.query as unknown as { page: number; limit: number };
    feedService
      .getPublishedFeed(query)
      .then((result) => {
        res.setHeader("X-Cache", result.meta.cache);
        res.status(200).json(result);
      })
      .catch(next);
  });

  app.post("/auth/register", validate(registerSchema), (req, res, next) => {
    authService
      .register(req.body)
      .then((data) => res.status(201).json({ data }))
      .catch(next);
  });

  app.post("/auth/login", validate(loginSchema), (req, res, next) => {
    authService
      .login(req.body)
      .then((data) => res.status(200).json({ data }))
      .catch(next);
  });

  const posts = express.Router();
  posts.use((req, res, next) => {
    requireAuth(req, res, next).catch(next);
  });

  posts.get("/", (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    feedService
      .listMine(req.user.id)
      .then((result) => res.status(200).json(result))
      .catch(next);
  });

  posts.post("/", validate(createPostSchema), (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    feedService
      .createPost(req.user.id, req.body)
      .then((data) => res.status(201).json({ data }))
      .catch(next);
  });

  posts.patch(
    "/:id",
    validate(uuidParamSchema, "params"),
    validate(updatePostSchema),
    (req, res, next) => {
      if (!req.user) return next(new UnauthorizedError());
      const { id } = req.params as { id: string };
      feedService
        .updatePost(id, req.user.id, req.body)
        .then((data) => res.status(200).json({ data }))
        .catch(next);
    },
  );

  posts.delete(
    "/:id",
    validate(uuidParamSchema, "params"),
    (req, res, next) => {
      if (!req.user) return next(new UnauthorizedError());
      const { id } = req.params as { id: string };
      feedService
        .deletePost(id, req.user.id)
        .then(() => res.status(204).send())
        .catch(next);
    },
  );

  app.use("/posts", posts);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
