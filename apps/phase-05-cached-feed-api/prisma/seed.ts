import bcrypt from "bcryptjs";
import { PrismaClient, Role } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const writer = await prisma.user.create({
    data: {
      email: "writer@example.com",
      name: "Writer",
      passwordHash,
      role: Role.USER,
    },
  });

  await prisma.post.createMany({
    data: [
      {
        title: "Hello from the public feed",
        body: "This published post is cached in Redis on GET /feed.",
        published: true,
        publishedAt: new Date(),
        authorId: writer.id,
      },
      {
        title: "Draft only",
        body: "This stays private until you publish it.",
        published: false,
        publishedAt: null,
        authorId: writer.id,
      },
    ],
  });

  console.log("Seeded writer@example.com / Password123!");
  console.log("1 published post + 1 draft");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
