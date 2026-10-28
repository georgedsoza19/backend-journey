import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/client.js";
import { ForbiddenError, UnauthorizedError } from "../lib/errors.js";
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
    const token = header.slice("Bearer ".length).trim();
    const claims = await verifyAccessToken(token);
    req.user = {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
    };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(new ForbiddenError("Insufficient role"));
      return;
    }
    next();
  };
}
