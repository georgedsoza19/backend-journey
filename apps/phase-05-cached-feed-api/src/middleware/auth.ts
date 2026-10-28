import type { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors.js";
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
