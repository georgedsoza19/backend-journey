import type { Request, Response } from "express";
import type { z } from "zod";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "../schemas/authSchemas.js";
import * as authService from "../services/authService.js";
import { UnauthorizedError } from "../lib/errors.js";

type RegisterBody = z.infer<typeof registerSchema>;
type LoginBody = z.infer<typeof loginSchema>;
type RefreshBody = z.infer<typeof refreshSchema>;

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as RegisterBody;
  const result = await authService.register(body);
  res.status(201).json({ data: result });
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = req.body as LoginBody;
  const result = await authService.login(body);
  res.status(200).json({ data: result });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const body = req.body as RefreshBody;
  const result = await authService.refresh(body.refreshToken);
  res.status(200).json({ data: result });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const body = req.body as RefreshBody;
  await authService.logout(body.refreshToken);
  res.status(204).send();
}

export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  const user = await authService.me(req.user.id);
  res.status(200).json({ data: user });
}
