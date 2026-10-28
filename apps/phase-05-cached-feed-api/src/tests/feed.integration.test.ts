import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { loadEnvFile } from "../loadEnv.js";

loadEnvFile();

const { createApp } = await import("../app.js");
const { prisma } = await import("../lib/prisma.js");
const { connectRedis, disconnectRedis, getRedis, FEED_CACHE_KEY } =
  await import("../lib/redis.js");
const { createLogger } = await import("../lib/logger.js");

const app = createApp(
  createLogger().child({ name: "test" }, { level: "silent" }),
);

async function clearData() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
  const redis = getRedis();
  const keys = await redis.smembers(FEED_CACHE_KEY);
  if (keys.length > 0) await redis.del(...keys);
  await redis.del(FEED_CACHE_KEY);
  const patternKeys = await redis.keys(`${FEED_CACHE_KEY}:*`);
  if (patternKeys.length > 0) await redis.del(...patternKeys);
}

beforeAll(async () => {
  await connectRedis();
});

afterAll(async () => {
  await clearData();
  await prisma.$disconnect();
  await disconnectRedis();
});

beforeEach(async () => {
  await clearData();
});

describe("Cached Feed API", () => {
  it("registers, creates a published post, and serves a cached feed", async () => {
    const register = await request(app).post("/auth/register").send({
      email: "cache-test@example.com",
      name: "Cache Tester",
      password: "Password123!",
    });
    expect(register.status).toBe(201);
    const token = register.body.data.accessToken as string;

    const create = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Cached headline",
        body: "Body for cache test",
        published: true,
      });
    expect(create.status).toBe(201);

    const miss = await request(app).get("/feed");
    expect(miss.status).toBe(200);
    expect(miss.headers["x-cache"]).toBe("MISS");
    expect(miss.body.data).toHaveLength(1);
    expect(miss.body.data[0].title).toBe("Cached headline");

    const hit = await request(app).get("/feed");
    expect(hit.status).toBe(200);
    expect(hit.headers["x-cache"]).toBe("HIT");
    expect(hit.body.data[0].title).toBe("Cached headline");
  });

  it("invalidates cache when a post is updated", async () => {
    const register = await request(app).post("/auth/register").send({
      email: "invalidate@example.com",
      name: "Invalidate",
      password: "Password123!",
    });
    const token = register.body.data.accessToken as string;

    const create = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Before",
        body: "v1",
        published: true,
      });
    const id = create.body.data.id as string;

    await request(app).get("/feed");
    const hit = await request(app).get("/feed");
    expect(hit.headers["x-cache"]).toBe("HIT");

    await request(app)
      .patch(`/posts/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "After" });

    const after = await request(app).get("/feed");
    expect(after.headers["x-cache"]).toBe("MISS");
    expect(after.body.data[0].title).toBe("After");
  });

  it("forbids updating someone else's post", async () => {
    const owner = await request(app).post("/auth/register").send({
      email: "owner@example.com",
      name: "Owner",
      password: "Password123!",
    });
    const other = await request(app).post("/auth/register").send({
      email: "other@example.com",
      name: "Other",
      password: "Password123!",
    });

    const created = await request(app)
      .post("/posts")
      .set("Authorization", `Bearer ${owner.body.data.accessToken}`)
      .send({ title: "Mine", body: "secret", published: true });

    const forbidden = await request(app)
      .patch(`/posts/${created.body.data.id}`)
      .set("Authorization", `Bearer ${other.body.data.accessToken}`)
      .send({ title: "Hijack" });

    expect(forbidden.status).toBe(403);
  });

  it("requires auth for /posts", async () => {
    const res = await request(app).get("/posts");
    expect(res.status).toBe(401);
  });
});
