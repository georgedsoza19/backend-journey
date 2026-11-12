import { loadEnvFile } from "./loadEnv.js";

loadEnvFile();

const { getConfig } = await import("./config.js");
const { createApp } = await import("./app.js");
const { connectRedis } = await import("./lib/redis.js");

await connectRedis();

const config = getConfig();
const app = createApp();

app.listen(config.port, () => {
  console.log(`ForgeBoard API listening on http://localhost:${config.port}`);
  console.log(`Swagger UI: http://localhost:${config.port}/docs`);
});
