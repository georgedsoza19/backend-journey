import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

export const listNotesQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  /** Admins only: list everyone's notes */
  scope: z.enum(["mine", "all"]).default("mine"),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  published: z.boolean().optional(),
});

export const updateNoteSchema = z
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
    { message: "Provide at least one field to update" },
  );
