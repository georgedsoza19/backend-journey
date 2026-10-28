import pino from "pino";
import { getConfig } from "../config.js";

export function createLogger() {
  const config = getConfig();
  return pino({
    level: config.logLevel,
    redact: {
      paths: [
        "req.headers.authorization",
        "password",
        "body.password",
        "refreshToken",
      ],
      censor: "[Redacted]",
    },
    ...(config.nodeEnv === "development"
      ? {
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "SYS:standard" },
          },
        }
      : {}),
  });
}

export type Logger = ReturnType<typeof createLogger>;
