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

export const refreshSchema = z.object({
  refreshToken: z.string().min(20),
});

export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  key: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .regex(/^[A-Z][A-Z0-9]*$/, "Key must be uppercase, e.g. ENG"),
});

export const listIssuesQuerySchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  assignee: z.string().uuid().optional(),
  q: z.string().trim().min(1).max(200).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createIssueSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().max(10_000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
  labels: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
});

export const updateIssueSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    body: z.string().trim().max(10_000).optional(),
    status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    assigneeId: z.string().uuid().nullable().optional(),
    labels: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  })
  .refine((body) => Object.keys(body).length > 0, {
    message: "Provide at least one field",
  });

export const createCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

export const uuidParam = (name: string) =>
  z.object({ [name]: z.string().uuid() });
