import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().trim().email().max(200),
  name: z.string().trim().min(1).max(100),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const createPostSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  published: z.boolean().optional(),
});

export const updatePostSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(10_000).optional(),
    published: z.boolean().optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.body !== undefined ||
      body.published !== undefined,
    { message: "Provide at least one field" },
  );

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const feedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});
