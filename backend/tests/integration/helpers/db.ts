import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

export const TEST_JWT_SECRET = "rosihome-postgres-integration-secret";

// Stable fixture identifiers shared across integration test files. Each test
// file builds its own disposable database, so reuse of these ids is safe.
export const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
export const OTHER_LANDLORD_ID = "44444444-4444-4444-8444-444444444444";
export const TENANT_USER_ID = "55555555-5555-4555-8555-555555555555";
export const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
export const ROOM_ID = "66666666-6666-4666-8666-666666666666";
export const TENANT_ROOM_ID = "66666666-6666-4666-8666-666666666667";
export const TENANT_INFO_ID = "77777777-7777-4777-8777-777777777777";
export const LEASE_ID = "88888888-8888-4888-8888-888888888888";
export const RATE_ID = "99999999-9999-4999-8999-999999999999";

export function sign(
  role: "Landlord" | "Tenant",
  sub: string = LANDLORD_ID,
  secret: string = TEST_JWT_SECRET,
): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, secret, {
    expiresIn: "1h",
  });
}

export function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

function withDatabaseName(connectionString: string, dbName: string): string {
  const url = new URL(connectionString);
  url.pathname = `/${dbName}`;
  return url.toString();
}

async function applyMigrations(dbPool: Pool): Promise<void> {
  const journalUrl = new URL(
    "../../../src/db/migrations/meta/_journal.json",
    import.meta.url,
  );
  const journal = JSON.parse(await readFile(journalUrl, "utf8")) as {
    entries: Array<{ idx: number; tag: string }>;
  };

  for (const entry of journal.entries) {
    const migrationUrl = new URL(
      `../../../src/db/migrations/${entry.tag}.sql`,
      import.meta.url,
    );
    const migration = (await readFile(migrationUrl, "utf8")).replaceAll(
      "--> statement-breakpoint",
      "",
    );
    await dbPool.query(migration);
  }
}

export type IntegrationHandles = {
  databaseName: string;
  adminPool: Pool;
  dbPool: Pool;
  appPool: Pool;
  app: import("express").Express;
};

// The generated migration hardcodes every foreign key to the "public" schema
// (drizzle-kit's default output), so a schema-per-test-run trick (`SET
// search_path`) doesn't cleanly isolate tests here. Instead each test file gets
// its own disposable database, applied with the full, unmodified migration set
// — closer to production and free of "public"-qualification edge cases.
export async function setupIntegrationDatabase(
  dbNamePrefix: string,
): Promise<IntegrationHandles> {
  const databaseUrl =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "TEST_DATABASE_URL or DATABASE_URL is required for PostgreSQL integration tests.",
    );
  }

  const databaseName = `${dbNamePrefix}_${randomUUID().replaceAll("-", "")}`;

  const adminPool = new Pool({
    connectionString: databaseUrl,
    max: 2,
    connectionTimeoutMillis: 10_000,
  });
  await adminPool.query(`CREATE DATABASE "${databaseName}"`);

  const scopedUrl = withDatabaseName(databaseUrl, databaseName);
  const dbPool = new Pool({
    connectionString: scopedUrl,
    max: 2,
    connectionTimeoutMillis: 10_000,
  });
  await applyMigrations(dbPool);

  process.env.DATABASE_URL = scopedUrl;
  process.env.JWT_SECRET = TEST_JWT_SECRET;

  const [{ createApp }, dbModule] = await Promise.all([
    import("../../../src/app.js"),
    import("../../../src/db/index.js"),
  ]);
  const app = createApp();
  const appPool = dbModule.pool;

  return { databaseName, adminPool, dbPool, appPool, app };
}

export async function teardownIntegrationDatabase(
  handles: IntegrationHandles,
): Promise<void> {
  const { adminPool, dbPool, appPool, databaseName } = handles;
  if (appPool) await appPool.end();
  if (dbPool) await dbPool.end();
  if (adminPool) {
    await adminPool.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
    await adminPool.end();
  }
}

// Truncates all business tables, resetting identity columns and cascading
// through foreign keys, so each test starts from a clean slate.
export async function resetCommonFixtures(dbPool: Pool): Promise<void> {
  await dbPool.query(
    "TRUNCATE audit_events, notifications, device_tokens, invoice_line_items, invoice_generation_skips, invoices, meter_readings, leases, tenant_info, utility_rate_history, rooms, properties, users RESTART IDENTITY CASCADE",
  );
}
