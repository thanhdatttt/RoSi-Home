import "dotenv/config";
import { createApp } from "./app.js";
import { config } from "./lib/config.js";
import { pool } from "./db/index.js";
import { registerJobs } from "./jobs/index.js";

const app = createApp();
const port = config.port;

const server = app.listen(port, () => {
  console.log(`RosiHome backend listening on :${port} (${config.nodeEnv})`);
});

registerJobs();

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down...`);
  server.close();
  await pool.end();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
