import { mkdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "./schema.js";

function createOrm(client: PGlite) {
  return drizzle({ client, schema });
}

export type AppDrizzle = ReturnType<typeof createOrm>;

export interface DatabaseConnection {
  client: PGlite;
  db: AppDrizzle;
  dataDir: string;
}

export async function createDatabase(
  dataDir = "memory://",
): Promise<DatabaseConnection> {
  if (dataDir !== "memory://") {
    await mkdir(dataDir, { recursive: true });
  }

  const client = new PGlite(dataDir);
  await client.waitReady;

  return {
    client,
    dataDir,
    db: createOrm(client),
  };
}
