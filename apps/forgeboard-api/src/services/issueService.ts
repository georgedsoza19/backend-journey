import { createHash } from "node:crypto";
import type { IssuePriority, IssueStatus } from "../generated/prisma/client.js";
import { getConfig } from "../config.js";
import { NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { getRedis, projectIssuesCachePrefix } from "../lib/redis.js";
import { assertProjectMembership } from "./projectService.js";

async function ensureLabels(projectId: string, names: string[]) {
  const unique = [...new Set(names.map((n) => n.toLowerCase()))];
  const labels = await Promise.all(
    unique.map((name) =>
      prisma.label.upsert({
        where: { projectId_name: { projectId, name } },
        create: { projectId, name, color: "#6b7280" },
        update: {},
      }),
    ),
  );
  return labels.map((l) => l.id);
}

async function invalidateProjectIssueCache(projectId: string) {
  const redis = getRedis();
  const prefix = projectIssuesCachePrefix(projectId);
  const keys = await redis.smembers(prefix);
  if (keys.length > 0) await redis.del(...keys);
  await redis.del(prefix);
}

function mapIssue(issue: {
  id: string;
  number: number;
  title: string;
  body: string;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  assignee: { id: string; email: string; name: string } | null;
  reporter: { id: string; email: string; name: string };
  labels: Array<{ label: { id: string; name: string; color: string } }>;
  comments?: Array<{
    id: string;
    body: string;
    createdAt: Date;
    author: { id: string; email: string; name: string };
  }>;
}, projectKey?: string) {
  return {
    id: issue.id,
    number: issue.number,
    key: projectKey ? `${projectKey}-${issue.number}` : undefined,
    title: issue.title,
    body: issue.body,
    status: issue.status,
    priority: issue.priority,
    projectId: issue.projectId,
    assignee: issue.assignee,
    reporter: issue.reporter,
    labels: issue.labels.map((l) => l.label),
    comments: issue.comments,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
  };
}

export async function listIssues(
  projectId: string,
  userId: string,
  query: {
    status?: IssueStatus;
    assignee?: string;
    q?: string;
    page: number;
    limit: number;
  },
) {
  const { project } = await assertProjectMembership(projectId, userId);

  const cachePayload = JSON.stringify(query);
  const hash = createHash("sha1").update(cachePayload).digest("hex").slice(0, 12);
  const cacheKey = `${projectIssuesCachePrefix(projectId)}:${hash}`;
  const redis = getRedis();

  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached) as {
      data: unknown[];
      meta: Record<string, unknown>;
    };
    return {
      ...parsed,
      meta: { ...parsed.meta, cache: "HIT" as const },
    };
  }

  const where = {
    projectId,
    ...(query.status ? { status: query.status } : {}),
    ...(query.assignee ? { assigneeId: query.assignee } : {}),
    ...(query.q
      ? { title: { contains: query.q, mode: "insensitive" as const } }
      : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.issue.count({ where }),
    prisma.issue.findMany({
      where,
      include: {
        assignee: { select: { id: true, email: true, name: true } },
        reporter: { select: { id: true, email: true, name: true } },
        labels: { include: { label: true } },
      },
      orderBy: [{ number: "desc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
  ]);

  const data = rows.map((issue) =>
    mapIssue({ ...issue, comments: undefined }, project.key),
  );

  const result = {
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
      cache: "MISS" as const,
    },
  };

  await redis.set(
    cacheKey,
    JSON.stringify(result),
    "EX",
    getConfig().issueCacheTtlSeconds,
  );
  await redis.sadd(projectIssuesCachePrefix(projectId), cacheKey);

  return result;
}

export async function createIssue(
  projectId: string,
  userId: string,
  input: {
    title: string;
    body?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeId?: string | null;
    labels?: string[];
  },
) {
  const { project } = await assertProjectMembership(projectId, userId);
  const labelIds = input.labels?.length
    ? await ensureLabels(projectId, input.labels)
    : [];

  const issue = await prisma.$transaction(async (tx) => {
    const latest = await tx.issue.findFirst({
      where: { projectId },
      orderBy: { number: "desc" },
      select: { number: true },
    });
    const number = (latest?.number ?? 0) + 1;

    return tx.issue.create({
      data: {
        projectId,
        number,
        title: input.title,
        body: input.body ?? "",
        status: input.status ?? "TODO",
        priority: input.priority ?? "MEDIUM",
        assigneeId: input.assigneeId ?? null,
        reporterId: userId,
        labels: {
          create: labelIds.map((labelId) => ({ labelId })),
        },
      },
      include: {
        assignee: { select: { id: true, email: true, name: true } },
        reporter: { select: { id: true, email: true, name: true } },
        labels: { include: { label: true } },
      },
    });
  });

  await invalidateProjectIssueCache(projectId);
  return mapIssue(issue, project.key);
}

export async function getIssue(issueId: string, userId: string) {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    include: {
      assignee: { select: { id: true, email: true, name: true } },
      reporter: { select: { id: true, email: true, name: true } },
      labels: { include: { label: true } },
      comments: {
        include: { author: { select: { id: true, email: true, name: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!issue) throw new NotFoundError("Issue not found");
  const { project } = await assertProjectMembership(issue.projectId, userId);
  return mapIssue(issue, project.key);
}

export async function updateIssue(
  issueId: string,
  userId: string,
  input: {
    title?: string;
    body?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeId?: string | null;
    labels?: string[];
  },
) {
  const existing = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!existing) throw new NotFoundError("Issue not found");
  const { project } = await assertProjectMembership(existing.projectId, userId);

  if (input.labels) {
    const labelIds = await ensureLabels(existing.projectId, input.labels);
    await prisma.issueLabel.deleteMany({ where: { issueId } });
    if (labelIds.length > 0) {
      await prisma.issueLabel.createMany({
        data: labelIds.map((labelId) => ({ issueId, labelId })),
      });
    }
  }

  const issue = await prisma.issue.update({
    where: { id: issueId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.assigneeId !== undefined ? { assigneeId: input.assigneeId } : {}),
    },
    include: {
      assignee: { select: { id: true, email: true, name: true } },
      reporter: { select: { id: true, email: true, name: true } },
      labels: { include: { label: true } },
    },
  });

  await invalidateProjectIssueCache(existing.projectId);
  return mapIssue(issue, project.key);
}

export async function addComment(
  issueId: string,
  userId: string,
  body: string,
) {
  const existing = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!existing) throw new NotFoundError("Issue not found");
  await assertProjectMembership(existing.projectId, userId);

  return prisma.comment.create({
    data: { issueId, authorId: userId, body },
    include: { author: { select: { id: true, email: true, name: true } } },
  });
}
