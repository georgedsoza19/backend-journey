import { PrismaClient } from "../src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.noteTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  const alice = await prisma.user.create({
    data: { email: "alice@example.com", name: "Alice" },
  });
  const bob = await prisma.user.create({
    data: { email: "bob@example.com", name: "Bob" },
  });

  const [backend, sql, learning] = await Promise.all([
    prisma.tag.create({ data: { name: "backend" } }),
    prisma.tag.create({ data: { name: "sql" } }),
    prisma.tag.create({ data: { name: "learning" } }),
  ]);

  await prisma.note.create({
    data: {
      title: "Postgres indexes",
      body: "Add indexes on foreign keys and frequently filtered columns.",
      authorId: alice.id,
      tags: {
        create: [{ tagId: backend.id }, { tagId: sql.id }],
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "Prisma migrations",
      body: "Use migrate dev locally and migrate deploy in CI/production.",
      authorId: alice.id,
      tags: {
        create: [{ tagId: backend.id }, { tagId: learning.id }],
      },
    },
  });

  await prisma.note.create({
    data: {
      title: "N:M relations",
      body: "Notes and tags share a join table so a note can have many tags.",
      authorId: bob.id,
      tags: {
        create: [{ tagId: sql.id }, { tagId: learning.id }],
      },
    },
  });

  console.log("Seeded users: alice@example.com, bob@example.com");
  console.log("Seeded 3 notes with tags: backend, sql, learning");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
