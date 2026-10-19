import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3002);
const app = createApp();

app.listen(port, () => {
  console.log(`Phase 2 TaskBoard API listening on http://localhost:${port}`);
  console.log("Try: GET /health  |  GET /tasks  |  POST /tasks");
});
