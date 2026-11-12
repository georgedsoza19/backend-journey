import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { loadEnvFile } from "../loadEnv.js";

loadEnvFile();

const { createApp } = await import("../app.js");
const { prisma } = await import("../lib/prisma.js");
const { connectRedis, disconnectRedis, getRedis } = await import("../lib/redis.js");
const { createLogger } = await import("../lib/logger.js");

const app = createApp(
  createLogger().child({ name: "test" }, { level: "silent" }),
);

async function clearAll() {
  await prisma.comment.deleteMany();
  await prisma.issueLabel.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.label.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  const redis = getRedis();
  const keys = await redis.keys("forgeboard:*");
  if (keys.length > 0) await redis.del(...keys);
}

beforeAll(async () => {
  await connectRedis();
});

afterAll(async () => {
  await clearAll();
  await prisma.$disconnect();
  await disconnectRedis();
});

beforeEach(async () => {
  await clearAll();
});

describe("ForgeBoard API", () => {
  it("registers, creates workspace/project/issue, and caches issue lists", async () => {
    const reg = await request(app).post("/auth/register").send({
      email: "owner@example.com",
      name: "Owner",
      password: "Password123!",
    });
    expect(reg.status).toBe(201);
    const token = reg.body.data.accessToken as string;

    const ws = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Demo Co", slug: "demo-co" });
    expect(ws.status).toBe(201);
    const workspaceId = ws.body.data.id as string;

    const project = await request(app)
      .post(`/workspaces/${workspaceId}/projects`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Core", key: "CORE" });
    expect(project.status).toBe(201);
    const projectId = project.body.data.id as string;

    const created = await request(app)
      .post(`/projects/${projectId}/issues`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "First issue", labels: ["bug"] });
    expect(created.status).toBe(201);
    expect(created.body.data.key).toBe("CORE-1");

    const miss = await request(app)
      .get(`/projects/${projectId}/issues`)
      .set("Authorization", `Bearer ${token}`);
    expect(miss.status).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");

    const hit = await request(app)
      .get(`/projects/${projectId}/issues`)
      .set("Authorization", `Bearer ${token}`);
    expect(hit.headers["x-cache"]).toBe("HIT");
  });

  it("blocks non-members from workspace projects", async () => {
    const owner = await request(app).post("/auth/register").send({
      email: "a@example.com",
      name: "A",
      password: "Password123!",
    });
    const stranger = await request(app).post("/auth/register").send({
      email: "b@example.com",
      name: "B",
      password: "Password123!",
    });

    const ws = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${owner.body.data.accessToken}`)
      .send({ name: "Private", slug: "private-ws" });

    const forbidden = await request(app)
      .get(`/workspaces/${ws.body.data.id}/projects`)
      .set("Authorization", `Bearer ${stranger.body.data.accessToken}`);

    expect(forbidden.status).toBe(403);
  });
});
