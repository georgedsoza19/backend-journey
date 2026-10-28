import { Prisma } from "@prisma/client";
import { NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

const noteInclude = {
  author: { select: { id: true, email: true, name: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.NoteInclude;

function serializeNote(
  note: Prisma.NoteGetPayload<{ include: typeof noteInclude }>,
) {
  return {
    id: note.id,
    title: note.title,
    body: note.body,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    author: note.author,
    tags: note.tags.map((entry) => entry.tag.name),
  };
}

async function ensureTags(tagNames: string[]): Promise<string[]> {
  const unique = [...new Set(tagNames.map((name) => name.toLowerCase()))];
  const tags = await Promise.all(
    unique.map((name) =>
      prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      }),
    ),
  );
  return tags.map((tag) => tag.id);
}

export async function listNotes(input: {
  q?: string;
  tag?: string;
  authorId?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.NoteWhereInput = {};

  if (input.q) {
    where.title = { contains: input.q, mode: "insensitive" };
  }
  if (input.authorId) {
    where.authorId = input.authorId;
  }
  if (input.tag) {
    where.tags = {
      some: { tag: { name: { equals: input.tag.toLowerCase() } } },
    };
  }

  const [total, notes] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      include: noteInclude,
      orderBy: { createdAt: "desc" },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  return {
    data: notes.map(serializeNote),
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
}

export async function getNote(id: string) {
  const note = await prisma.note.findUnique({
    where: { id },
    include: noteInclude,
  });
  if (!note) {
    throw new NotFoundError(`Note not found: ${id}`);
  }
  return serializeNote(note);
}

export async function createNote(input: {
  title: string;
  body: string;
  authorId: string;
  tags: string[];
}) {
  const author = await prisma.user.findUnique({ where: { id: input.authorId } });
  if (!author) {
    throw new NotFoundError(`Author not found: ${input.authorId}`);
  }

  const tagIds = await ensureTags(input.tags);

  const note = await prisma.note.create({
    data: {
      title: input.title,
      body: input.body,
      authorId: input.authorId,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
    include: noteInclude,
  });

  return serializeNote(note);
}

export async function updateNote(
  id: string,
  input: { title?: string; body?: string; tags?: string[] },
) {
  const existing = await prisma.note.findUnique({ where: { id } });
  if (!existing) {
    throw new NotFoundError(`Note not found: ${id}`);
  }

  const tagIds =
    input.tags === undefined ? undefined : await ensureTags(input.tags);

  const note = await prisma.$transaction(async (tx) => {
    if (tagIds) {
      await tx.noteTag.deleteMany({ where: { noteId: id } });
      if (tagIds.length > 0) {
        await tx.noteTag.createMany({
          data: tagIds.map((tagId) => ({ noteId: id, tagId })),
        });
      }
    }

    return tx.note.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.body !== undefined ? { body: input.body } : {}),
      },
      include: noteInclude,
    });
  });

  return serializeNote(note);
}

export async function deleteNote(id: string): Promise<void> {
  try {
    await prisma.note.delete({ where: { id } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundError(`Note not found: ${id}`);
    }
    throw error;
  }
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, createdAt: true },
  });
  return { data: users };
}
