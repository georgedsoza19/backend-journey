import type { NextFunction, Request, Response } from "express";
import type { WorkspaceRole } from "../generated/prisma/client.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/tokens.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing Bearer token");
    }
    const claims = await verifyAccessToken(header.slice("Bearer ".length).trim());
    req.user = { id: claims.sub, email: claims.email, name: claims.name };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function requireWorkspaceMember(paramName = "workspaceId") {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) throw new UnauthorizedError();
      const workspaceId = req.params[paramName];
      if (!workspaceId) throw new ForbiddenError("Missing workspace id");

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: req.user.id,
          },
        },
      });
      if (!membership) throw new ForbiddenError("Not a workspace member");

      req.membership = {
        workspaceId: membership.workspaceId,
        role: membership.role,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requireWorkspaceRoles(...roles: WorkspaceRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.membership) {
      next(new ForbiddenError("Missing membership context"));
      return;
    }
    if (!roles.includes(req.membership.role)) {
      next(new ForbiddenError("Insufficient workspace role"));
      return;
    }
    next();
  };
}
