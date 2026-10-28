import { getConfig } from "../config.js";
import { ForbiddenError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { FEED_CACHE_KEY, getRedis } from "../lib/redis.js";

const postSelect = {
  id: true,
  title: true,
  body: true,
  published: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: { select: { id: true, email: true, name: true } },
} as const;

export type FeedResult = {
  data: Array<{
    id: string;
    title: string;
    body: string;
    published: boolean;
    publishedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
    author: { id: string; email: string; name: string };
  }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    cache: "HIT" | "MISS";
  };
};

export async function getPublishedFeed(input: {
  page: number;
  limit: number;
}): Promise<FeedResult> {
  const redis = getRedis();
  const cacheKey = `${FEED_CACHE_KEY}:p${input.page}:l${input.limit}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached) as FeedResult;
    return {
      ...parsed,
      meta: { ...parsed.meta, cache: "HIT" },
    };
  }

  const where = { published: true };
  const [total, data] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      select: postSelect,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
  ]);

  const result: FeedResult = {
    data,
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
      cache: "MISS",
    },
  };

  await redis.set(
    cacheKey,
    JSON.stringify(result),
    "EX",
    getConfig().feedCacheTtlSeconds,
  );
  // Track keys for bulk invalidation
  await redis.sadd(FEED_CACHE_KEY, cacheKey);

  return result;
}

export async function listMine(userId: string) {
  const data = await prisma.post.findMany({
    where: { authorId: userId },
    select: postSelect,
    orderBy: { createdAt: "desc" },
  });
  return { data };
}

export async function createPost(
  userId: string,
  input: { title: string; body: string; published?: boolean },
) {
  const published = input.published ?? false;
  const post = await prisma.post.create({
    data: {
      title: input.title,
      body: input.body,
      published,
      publishedAt: published ? new Date() : null,
      authorId: userId,
    },
    select: postSelect,
  });
  if (published) await invalidateFeedCacheKeys();
  return post;
}

export async function updatePost(
  id: string,
  userId: string,
  input: { title?: string; body?: string; published?: boolean },
) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Post not found: ${id}`);
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You do not own this post");
  }

  const published = input.published;
  const post = await prisma.post.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(published !== undefined
        ? {
            published,
            publishedAt: published
              ? (existing.publishedAt ?? new Date())
              : null,
          }
        : {}),
    },
    select: postSelect,
  });

  await invalidateFeedCacheKeys();
  return post;
}

export async function deletePost(id: string, userId: string): Promise<void> {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError(`Post not found: ${id}`);
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You do not own this post");
  }
  await prisma.post.delete({ where: { id } });
  await invalidateFeedCacheKeys();
}

async function invalidateFeedCacheKeys(): Promise<void> {
  const redis = getRedis();
  const keys = await redis.smembers(FEED_CACHE_KEY);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  await redis.del(FEED_CACHE_KEY);
}
