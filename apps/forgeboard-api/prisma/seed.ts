import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.issueLabel.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const alice = await prisma.user.create({
    data: {
      email: "alice@forgeboard.dev",
      name: "Alice Owner",
      passwordHash,
    },
  });
  const bob = await prisma.user.create({
    data: {
      email: "bob@forgeboard.dev",
      name: "Bob Member",
      passwordHash,
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: "Acme Engineering",
      slug: "acme",
      members: {
        create: [
          { userId: alice.id, role: "OWNER" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
      projects: {
        create: { name: "Platform", key: "PLAT" },
      },
    },
    include: { projects: true },
  });

  const project = workspace.projects[0]!;

  const bug = await prisma.label.create({
    data: { projectId: project.id, name: "bug", color: "#ef4444" },
  });

  await prisma.issue.create({
    data: {
      projectId: project.id,
      number: 1,
      title: "Ship ForgeBoard MVP",
      body: "Capstone checklist from the roadmap.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      reporterId: alice.id,
      assigneeId: bob.id,
      labels: { create: [{ labelId: bug.id }] },
      comments: {
        create: {
          authorId: alice.id,
          body: "Let's keep scope tight for the portfolio.",
        },
      },
    },
  });

  console.log("Seeded ForgeBoard demo:");
  console.log("  alice@forgeboard.dev / Password123! (owner)");
  console.log("  bob@forgeboard.dev / Password123! (member)");
  console.log(`  workspace slug=acme project=${project.key}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
