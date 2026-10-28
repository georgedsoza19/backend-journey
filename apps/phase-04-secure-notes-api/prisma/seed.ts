import { PrismaClient, Role } from "../src/generated/prisma/client.js";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.refreshToken.deleteMany();
  await prisma.note.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const alice = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice",
      passwordHash,
      role: Role.USER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      name: "Admin",
      passwordHash,
      role: Role.ADMIN,
    },
  });

  await prisma.note.createMany({
    data: [
      {
        title: "Alice private note",
        body: "Only Alice should see this in her list.",
        authorId: alice.id,
        published: false,
      },
      {
        title: "Admin checklist",
        body: "Admins can list all notes via GET /notes?scope=all",
        authorId: admin.id,
        published: true,
      },
    ],
  });

  console.log("Seeded users (password for both: Password123!)");
  console.log("  alice@example.com (USER)");
  console.log("  admin@example.com (ADMIN)");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
