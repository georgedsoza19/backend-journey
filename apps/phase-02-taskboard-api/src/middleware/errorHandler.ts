import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";

export function notFoundHandler(
  _req: Request,
  _res: Response,
  next: NextFunction,
): void {
  next(new AppError(404, "Route not found", "ROUTE_NOT_FOUND"));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof SyntaxError) {
    res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must be valid JSON",
      },
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
    },
  });
}
