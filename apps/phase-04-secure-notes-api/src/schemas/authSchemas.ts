import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(100),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});
