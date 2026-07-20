import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import request from "supertest";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from "vitest";

const TEST_JWT_SECRET = "billing-postgres-integration-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_LANDLORD_ID = "44444444-4444-4444-8444-444444444444";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";

const databaseName = `billing_batch1_${randomUUID().replaceAll("-", "")}`;

let adminPool: Pool;
let dbPool: Pool;
let appPool: Pool;
let app: import("express").Express;
let createSurchargeService: typeof import(
  "../../src/modules/charges/service.js"
).createSurchargeService;
let landlordToken: string;
let otherLandlordToken: string;

function withDatabaseName(connectionString: string, dbName: string): string {
  const url = new URL(connectionString);
  url.pathname = `/${dbName}`;
  return url.toString();
}

function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

async function applyBillingMigration(): Promise<void> {
  const journalUrl = new URL(
    "../../src/db/migrations/meta/_journal.json",
    import.meta.url,
  );
  const journal = JSON.parse(
    await readFile(journalUrl, "utf8"),
  ) as { entries: Array<{ idx: number; tag: string }> };
  for (const entry of journal.entries) {
    const migrationUrl = new URL(
      `../../src/db/migrations/${entry.tag}.sql`,
      import.meta.url,
    );
    const migration = (
      await readFile(migrationUrl, "utf8")
    ).replaceAll("--> statement-breakpoint", "");

    await dbPool.query(migration);
  }
}

async function resetFixtures(): Promise<void> {
  await dbPool.query(
    "TRUNCATE audit_events, utility_rate_history, surcharges, properties, users RESTART IDENTITY CASCADE",
  );
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
       VALUES ($1, 'Landlord', 'landlord-a', 'not-used'),
             ($2, 'Landlord', 'landlord-b', 'not-used')`,
    [LANDLORD_ID, OTHER_LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address)
       VALUES ($1, $2, 'Property A', 'Address A')`,
    [PROPERTY_ID, LANDLORD_ID],
  );
}

describe("Billing Foundation PostgreSQL integration", () => {
  beforeAll(async () => {
    const databaseUrl =
      process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "TEST_DATABASE_URL or DATABASE_URL is required for PostgreSQL integration tests.",
      );
    }

    adminPool = new Pool({
      connectionString: databaseUrl,
      max: 2,
      connectionTimeoutMillis: 10_000,
    });
    await adminPool.query(`CREATE DATABASE "${databaseName}"`);

    const scopedUrl = withDatabaseName(databaseUrl, databaseName);
    dbPool = new Pool({
      connectionString: scopedUrl,
      max: 2,
      connectionTimeoutMillis: 10_000,
    });
    await applyBillingMigration();

    process.env.DATABASE_URL = scopedUrl;
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    const [{ createApp }, chargeService, dbModule] = await Promise.all([
      import("../../src/app.js"),
      import("../../src/modules/charges/service.js"),
      import("../../src/db/index.js"),
    ]);
    app = createApp();
    createSurchargeService = chargeService.createSurchargeService;
    appPool = dbModule.pool;

    landlordToken = jwt.sign(
      {
        sub: LANDLORD_ID,
        role: "Landlord",
        mustChangePassword: false,
      },
      TEST_JWT_SECRET,
      { expiresIn: "1h" },
    );
    otherLandlordToken = jwt.sign(
      {
        sub: OTHER_LANDLORD_ID,
        role: "Landlord",
        mustChangePassword: false,
      },
      TEST_JWT_SECRET,
      { expiresIn: "1h" },
    );
  });

  beforeEach(async () => {
    await resetFixtures();
  });

  afterAll(async () => {
    if (appPool) await appPool.end();
    if (dbPool) await dbPool.end();
    if (adminPool) {
      await adminPool.query(`DROP DATABASE IF EXISTS "${databaseName}"`);
      await adminPool.end();
    }
  });

  it("applies the generated migration as a non-unique partial index", async () => {
    const result = await dbPool.query<{
      indisunique: boolean;
      predicate: string | null;
    }>(
      `
        SELECT index.indisunique,
               pg_get_expr(index.indpred, index.indrelid) AS predicate
        FROM pg_class index_class
        JOIN pg_index index ON index.indexrelid = index_class.oid
        JOIN pg_namespace namespace ON namespace.oid = index_class.relnamespace
        WHERE namespace.nspname = $1
          AND index_class.relname = 'surcharges_name_active'
      `,
      ["public"],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].indisunique).toBe(false);
    expect(result.rows[0].predicate).toContain("deleted_at IS NULL");
    expect(result.rows[0].predicate).toContain("active = true");
  });

  it("migrates audit snapshots from text to JSONB", async () => {
    const result = await dbPool.query<{ data_type: string }>(
      `
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = 'audit_events'
          AND column_name IN ('before_value', 'after_value')
        ORDER BY column_name
      `,
      ["public"],
    );

    expect(result.rows.map((row) => row.data_type)).toEqual([
      "jsonb",
      "jsonb",
    ]);
  });

  it("returns 404 when another landlord requests the property's rate", async () => {
    const response = await request(app)
      .get(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set(auth(otherLandlordToken))
      .expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rolls back a utility rate when its audit insert fails", async () => {
    await dbPool.query(`
      ALTER TABLE audit_events
      ADD CONSTRAINT reject_utility_rate_audit
      CHECK (action <> 'utility_rate.created')
    `);

    try {
      await request(app)
        .post(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
        .set(auth(landlordToken))
        .send({
          electricityRatePerKwh: 3500,
          waterBillingMethod: "Metered",
          waterRatePerM3: 15000,
          effectiveFrom: "2026-07-01",
        })
        .expect(500);

      const result = await dbPool.query(
        "SELECT count(*)::integer AS count FROM utility_rate_history",
      );
      expect(result.rows[0].count).toBe(0);
    } finally {
      await dbPool.query(`
        ALTER TABLE audit_events
        DROP CONSTRAINT IF EXISTS reject_utility_rate_audit
      `);
    }
  });

  it("allows same-name versions when their inclusive periods do not overlap", async () => {
    await createSurchargeService(LANDLORD_ID, PROPERTY_ID, {
      name: "Internet",
      monthlyAmount: 100000,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-06-30",
    });
    await createSurchargeService(LANDLORD_ID, PROPERTY_ID, {
      name: "Internet",
      monthlyAmount: 120000,
      effectiveFrom: "2026-07-01",
    });

    const result = await dbPool.query(
      "SELECT count(*)::integer AS count FROM surcharges WHERE name = 'Internet'",
    );
    expect(result.rows[0].count).toBe(2);
  });

  it("serializes concurrent overlapping writes and commits exactly one", async () => {
    const attempts = await Promise.allSettled([
      createSurchargeService(LANDLORD_ID, PROPERTY_ID, {
        name: "Parking",
        monthlyAmount: 50000,
        effectiveFrom: "2026-07-01",
      }),
      createSurchargeService(LANDLORD_ID, PROPERTY_ID, {
        name: "Parking",
        monthlyAmount: 60000,
        effectiveFrom: "2026-07-01",
      }),
    ]);

    expect(
      attempts.filter((attempt) => attempt.status === "fulfilled"),
    ).toHaveLength(1);
    expect(
      attempts.filter(
        (attempt) =>
          attempt.status === "rejected" &&
          (attempt.reason as { code?: string }).code === "CONFLICT",
      ),
    ).toHaveLength(1);

    const result = await dbPool.query(
      "SELECT count(*)::integer AS count FROM surcharges WHERE name = 'Parking'",
    );
    expect(result.rows[0].count).toBe(1);
  });
});
