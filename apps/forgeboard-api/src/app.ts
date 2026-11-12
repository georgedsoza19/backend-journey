import { randomUUID } from "node:crypto";
import cors from "cors";
import express, {
  type NextFunction,
  type Request,
  type RequestHandler,
  type Response,
} from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { getConfig } from "./config.js";
import { UnauthorizedError } from "./lib/errors.js";
import { createLogger } from "./lib/logger.js";
import { prisma } from "./lib/prisma.js";
import { getRedis } from "./lib/redis.js";
import {
  requireAuth,
  requireWorkspaceMember,
  requireWorkspaceRoles,
} from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { validate } from "./middleware/validate.js";
import { openApiDocument } from "./openapi.js";
import {
  addMemberSchema,
  createCommentSchema,
  createIssueSchema,
  createProjectSchema,
  createWorkspaceSchema,
  listIssuesQuerySchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  updateIssueSchema,
  uuidParam,
} from "./schemas.js";
import * as authService from "./services/authService.js";
import * as issueService from "./services/issueService.js";
import * as projectService from "./services/projectService.js";
import * as workspaceService from "./services/workspaceService.js";

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

export function createApp(logger = createLogger()) {
  const config = getConfig();
  const app = express();

  app.use(helmet({ contentSecurityPolicy: false }));
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
  });
  app.use(httpLogger as unknown as RequestHandler);

  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, service: "forgeboard-api" });
  });

  app.get(
    "/ready",
    asyncHandler(async (_req, res) => {
      const checks: Record<string, "ok" | "error"> = {
        postgres: "error",
        redis: "error",
      };
      try {
        await prisma.$queryRaw`SELECT 1`;
        checks.postgres = "ok";
      } catch {
        checks.postgres = "error";
      }
      try {
        checks.redis = (await getRedis().ping()) === "PONG" ? "ok" : "error";
      } catch {
        checks.redis = "error";
      }
      const ready = checks.postgres === "ok" && checks.redis === "ok";
      res.status(ready ? 200 : 503).json({ ok: ready, checks });
    }),
  );

  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "ForgeBoard API",
      docs: "/docs",
      openapi: "/openapi.json",
    });
  });

  app.get("/openapi.json", (_req, res) => {
    res.status(200).json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

  // Auth
  app.post(
    "/auth/register",
    validate(registerSchema),
    asyncHandler(async (req, res) => {
      const data = await authService.register(req.body);
      res.status(201).json({ data });
    }),
  );
  app.post(
    "/auth/login",
    validate(loginSchema),
    asyncHandler(async (req, res) => {
      const data = await authService.login(req.body);
      res.status(200).json({ data });
    }),
  );
  app.post(
    "/auth/refresh",
    validate(refreshSchema),
    asyncHandler(async (req, res) => {
      const data = await authService.refresh(req.body.refreshToken);
      res.status(200).json({ data });
    }),
  );
  app.post(
    "/auth/logout",
    validate(refreshSchema),
    asyncHandler(async (req, res) => {
      await authService.logout(req.body.refreshToken);
      res.status(204).send();
    }),
  );
  app.get(
    "/auth/me",
    asyncHandler(async (req, res) => {
      await requireAuth(req, res, async (err) => {
        if (err) throw err;
        if (!req.user) throw new UnauthorizedError();
        const data = await authService.me(req.user.id);
        res.status(200).json({ data });
      });
    }),
  );

  const authed: RequestHandler = (req, res, next) => {
    requireAuth(req, res, next).catch(next);
  };

  // Workspaces
  app.get(
    "/workspaces",
    authed,
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      res.status(200).json(await workspaceService.listMyWorkspaces(req.user.id));
    }),
  );
  app.post(
    "/workspaces",
    authed,
    validate(createWorkspaceSchema),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const data = await workspaceService.createWorkspace(req.user.id, req.body);
      res.status(201).json({ data });
    }),
  );
  app.get(
    "/workspaces/:workspaceId/members",
    authed,
    validate(uuidParam("workspaceId"), "params"),
    requireWorkspaceMember("workspaceId"),
    asyncHandler(async (req, res) => {
      const { workspaceId } = req.params as { workspaceId: string };
      res.status(200).json(await workspaceService.listMembers(workspaceId));
    }),
  );
  app.post(
    "/workspaces/:workspaceId/members",
    authed,
    validate(uuidParam("workspaceId"), "params"),
    requireWorkspaceMember("workspaceId"),
    requireWorkspaceRoles("OWNER", "ADMIN"),
    validate(addMemberSchema),
    asyncHandler(async (req, res) => {
      const { workspaceId } = req.params as { workspaceId: string };
      if (!req.membership) throw new UnauthorizedError();
      const data = await workspaceService.addMember(
        workspaceId,
        req.membership.role,
        req.body,
      );
      res.status(201).json({ data });
    }),
  );

  // Projects
  app.get(
    "/workspaces/:workspaceId/projects",
    authed,
    validate(uuidParam("workspaceId"), "params"),
    requireWorkspaceMember("workspaceId"),
    asyncHandler(async (req, res) => {
      const { workspaceId } = req.params as { workspaceId: string };
      res.status(200).json(await projectService.listProjects(workspaceId));
    }),
  );
  app.post(
    "/workspaces/:workspaceId/projects",
    authed,
    validate(uuidParam("workspaceId"), "params"),
    requireWorkspaceMember("workspaceId"),
    validate(createProjectSchema),
    asyncHandler(async (req, res) => {
      const { workspaceId } = req.params as { workspaceId: string };
      const data = await projectService.createProject(workspaceId, req.body);
      res.status(201).json({ data });
    }),
  );

  // Issues
  app.get(
    "/projects/:projectId/issues",
    authed,
    validate(uuidParam("projectId"), "params"),
    validate(listIssuesQuerySchema, "query"),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const { projectId } = req.params as { projectId: string };
      const result = await issueService.listIssues(
        projectId,
        req.user.id,
        req.query as never,
      );
      res.setHeader("X-Cache", String(result.meta.cache));
      res.status(200).json(result);
    }),
  );
  app.post(
    "/projects/:projectId/issues",
    authed,
    validate(uuidParam("projectId"), "params"),
    validate(createIssueSchema),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const { projectId } = req.params as { projectId: string };
      const data = await issueService.createIssue(
        projectId,
        req.user.id,
        req.body,
      );
      res.status(201).json({ data });
    }),
  );
  app.get(
    "/issues/:issueId",
    authed,
    validate(uuidParam("issueId"), "params"),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const { issueId } = req.params as { issueId: string };
      const data = await issueService.getIssue(issueId, req.user.id);
      res.status(200).json({ data });
    }),
  );
  app.patch(
    "/issues/:issueId",
    authed,
    validate(uuidParam("issueId"), "params"),
    validate(updateIssueSchema),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const { issueId } = req.params as { issueId: string };
      const data = await issueService.updateIssue(
        issueId,
        req.user.id,
        req.body,
      );
      res.status(200).json({ data });
    }),
  );
  app.post(
    "/issues/:issueId/comments",
    authed,
    validate(uuidParam("issueId"), "params"),
    validate(createCommentSchema),
    asyncHandler(async (req, res) => {
      if (!req.user) throw new UnauthorizedError();
      const { issueId } = req.params as { issueId: string };
      const data = await issueService.addComment(
        issueId,
        req.user.id,
        req.body.body,
      );
      res.status(201).json({ data });
    }),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
