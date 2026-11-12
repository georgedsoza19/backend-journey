import type { WorkspaceRole } from "../generated/prisma/client.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function createWorkspace(
  userId: string,
  input: { name: string; slug: string },
) {
  const slug = input.slug.toLowerCase();
  const existing = await prisma.workspace.findUnique({ where: { slug } });
  if (existing) throw new ConflictError("Workspace slug already taken");

  return prisma.workspace.create({
    data: {
      name: input.name,
      slug,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
  });
}

export async function listMyWorkspaces(userId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    data: memberships.map((m) => ({
      ...m.workspace,
      role: m.role,
    })),
  };
}

export async function listMembers(workspaceId: string) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: { select: { id: true, email: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });
  return {
    data: members.map((m) => ({
      role: m.role,
      user: m.user,
      joinedAt: m.createdAt,
    })),
  };
}

export async function addMember(
  workspaceId: string,
  actorRole: WorkspaceRole,
  input: { email: string; role: "ADMIN" | "MEMBER" },
) {
  if (actorRole !== "OWNER" && actorRole !== "ADMIN") {
    throw new ForbiddenError("Only owners/admins can add members");
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) throw new NotFoundError("User not found — they must register first");

  try {
    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: input.role,
      },
      include: { user: { select: { id: true, email: true, name: true } } },
    });
    return { role: member.role, user: member.user, joinedAt: member.createdAt };
  } catch {
    throw new ConflictError("User is already a member");
  }
}
