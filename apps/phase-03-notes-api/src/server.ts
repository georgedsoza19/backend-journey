import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3003);
const app = createApp();

app.listen(port, () => {
  console.log(`Phase 3 Notes API listening on http://localhost:${port}`);
  console.log("Try: GET /health  |  GET /users  |  GET /notes?q=prisma");
});
