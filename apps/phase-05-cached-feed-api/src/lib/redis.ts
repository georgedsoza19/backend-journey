import { Redis } from "ioredis";
import { getConfig } from "../config.js";

const globalForRedis = globalThis as unknown as { redis?: Redis };

export function getRedis(): Redis {
  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(getConfig().redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
  }
  return globalForRedis.redis;
}

export async function connectRedis(): Promise<void> {
  const redis = getRedis();
  if (redis.status === "wait" || redis.status === "end") {
    await redis.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  if (globalForRedis.redis) {
    await globalForRedis.redis.quit();
    globalForRedis.redis = undefined;
  }
}

export const FEED_CACHE_KEY = "feed:published:v1";
