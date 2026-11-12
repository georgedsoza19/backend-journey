import { ConflictError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

export async function createProject(
  workspaceId: string,
  input: { name: string; key: string },
) {
  const key = input.key.toUpperCase();
  try {
    return await prisma.project.create({
      data: { workspaceId, name: input.name, key },
    });
  } catch {
    throw new ConflictError("Project key already exists in this workspace");
  }
}

export async function listProjects(workspaceId: string) {
  const data = await prisma.project.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "asc" },
  });
  return { data };
}

export async function getProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw new NotFoundError("Project not found");
  return project;
}

export async function assertProjectMembership(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: {
          members: { where: { userId } },
        },
      },
    },
  });
  if (!project) throw new NotFoundError("Project not found");
  const membership = project.workspace.members[0];
  if (!membership) throw new NotFoundError("Project not found");
  return { project, membership };
}
