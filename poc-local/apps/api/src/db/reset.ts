import { createDatabase } from "./client.js";
import { initializeDatabase, resetDatabase } from "./initialize.js";
import { getRuntimeConfig } from "../config.js";

const config = getRuntimeConfig();
const database = await createDatabase(config.dataDir);

try {
  await initializeDatabase(database);
  await resetDatabase(database);
  console.log(`Local PoC data reset at ${database.dataDir}`);
} finally {
  await database.client.close();
}
