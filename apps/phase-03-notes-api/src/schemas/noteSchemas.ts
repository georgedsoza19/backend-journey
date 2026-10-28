import { z } from "zod";

export const uuidParamSchema = z.object({
  id: z.string().uuid("Id must be a UUID"),
});

export const listNotesQuerySchema = z.object({
  q: z.string().trim().min(1).max(200).optional(),
  tag: z.string().trim().min(1).max(50).optional(),
  authorId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const createNoteSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(10_000),
  authorId: z.string().uuid("authorId must be a UUID"),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().min(1).max(10_000).optional(),
    tags: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
  })
  .refine(
    (body) =>
      body.title !== undefined ||
      body.body !== undefined ||
      body.tags !== undefined,
    { message: "Provide at least one of: title, body, tags" },
  );
