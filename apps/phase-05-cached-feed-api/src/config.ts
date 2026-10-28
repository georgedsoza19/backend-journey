function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export function getConfig() {
  return {
    port: Number(process.env.PORT ?? 3005),
    nodeEnv: process.env.NODE_ENV ?? "development",
    corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
    jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    jwtRefreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
    feedCacheTtlSeconds: Number(process.env.FEED_CACHE_TTL_SECONDS ?? 30),
    logLevel: process.env.LOG_LEVEL ?? "info",
  };
}
