export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "ForgeBoard API",
    version: "0.1.0",
    description:
      "Team issue tracker capstone — workspaces, projects, issues, comments.",
  },
  servers: [{ url: "http://localhost:3006", description: "Local" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
  },
  paths: {
    "/health": {
      get: { summary: "Liveness", responses: { "200": { description: "OK" } } },
    },
    "/ready": {
      get: {
        summary: "Readiness (Postgres + Redis)",
        responses: {
          "200": { description: "Ready" },
          "503": { description: "Not ready" },
        },
      },
    },
    "/auth/register": {
      post: { summary: "Register", responses: { "201": { description: "Created" } } },
    },
    "/auth/login": {
      post: { summary: "Login", responses: { "200": { description: "OK" } } },
    },
    "/workspaces": {
      get: {
        summary: "List my workspaces",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create workspace",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Created" } },
      },
    },
    "/projects/{projectId}/issues": {
      get: {
        summary: "List issues (Redis-cached)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "projectId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          { name: "status", in: "query", schema: { type: "string" } },
          { name: "q", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "OK" } },
      },
      post: {
        summary: "Create issue",
        security: [{ bearerAuth: [] }],
        responses: { "201": { description: "Created" } },
      },
    },
  },
} as const;
