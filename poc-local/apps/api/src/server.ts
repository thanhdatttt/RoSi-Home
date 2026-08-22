import { createApp } from "./app.js";
import { getRuntimeConfig } from "./config.js";
import { createDatabase } from "./db/client.js";
import { initializeDatabase } from "./db/initialize.js";
import { networkInterfaces } from "node:os";

function localIpv4Addresses(): string[] {
  return Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === "IPv4" && !address.internal)
    .map((address) => address.address);
}

const config = getRuntimeConfig();
const database = await createDatabase(config.dataDir);
await initializeDatabase(database);

const app = createApp({
  database,
  enablePocReset: config.host === "127.0.0.1",
  environment: config.environment,
  jwtSecret: config.jwtSecret,
});

const server = app.listen(config.port, config.host, () => {
  console.log(`RoSi-Home local PoC API listening on ${config.host}:${config.port}`);
  if (config.host === "0.0.0.0") {
    for (const address of localIpv4Addresses()) {
      console.log(`iPhone API candidate: http://${address}:${config.port}`);
    }
    console.log("LAN mode exposes synthetic PoC data to the current network only.");
  } else {
    console.log(`Loopback API: http://${config.host}:${config.port}`);
  }
  console.log(`PGlite data: ${database.dataDir}`);
});

let shuttingDown = false;
async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  server.close(async () => {
    await database.client.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
