import { Role, type Prisma } from "../generated/prisma/client.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

const noteSelect = {
  id: true,
  title: true,
  body: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: { select: { id: true, email: true, name: true } },
} satisfies Prisma.NoteSelect;

export async function listNotes(input: {
  userId: string;
  role: Role;
  q?: string;
  page: number;
  limit: number;
  scope: "mine" | "all";
}) {
  if (input.scope === "all" && input.role !== Role.ADMIN) {
    throw new ForbiddenError("Only admins can list all notes");
  }

  const where: Prisma.NoteWhereInput = {};
  if (input.scope === "mine") {
    where.authorId = input.userId;
  }
  if (input.q) {
    where.title = { contains: input.q, mode: "insensitive" };
  }

  const [total, data] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      select: noteSelect,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  return {
    data,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
}

export async function getNote(id: string, userId: string, role: Role) {
  const note = await prisma.note.findUnique({
    where: { id },
    select: noteSelect,
  });
  if (!note) {
    throw new NotFoundError(`Note not found: ${id}`);
  }
  if (note.authorId !== userId && role !== Role.ADMIN) {
    throw new ForbiddenError("You do not own this note");
  }
  return note;
}

export async function createNote(
  userId: string,
  input: { title: string; body: string; published?: boolean },
) {
  return prisma.note.create({
    data: {
      title: input.title,
      body: input.body,
      published: input.published ?? false,
      authorId: userId,
    },
    select: noteSelect,
  });
}

export async function updateNote(
  id: string,
  userId: string,
  role: Role,
  input: { title?: string; body?: string; published?: boolean },
) {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Note not found: ${id}`);
  }
  if (existing.authorId !== userId && role !== Role.ADMIN) {
    throw new ForbiddenError("You do not own this note");
  }

  return prisma.note.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.published !== undefined ? { published: input.published } : {}),
    },
    select: noteSelect,
  });
}

export async function deleteNote(
  id: string,
  userId: string,
  role: Role,
): Promise<void> {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Note not found: ${id}`);
  }
  if (existing.authorId !== userId && role !== Role.ADMIN) {
    throw new ForbiddenError("You do not own this note");
  }
  await prisma.note.delete({ where: { id } });
}
