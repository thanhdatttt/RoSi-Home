import "dotenv/config";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import jwt from "jsonwebtoken";
import { Pool, type PoolClient } from "pg";
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

const schemaName = `billing_batch1_${randomUUID().replaceAll("-", "")}`;
const quotedSchema = `"${schemaName}"`;

let adminPool: Pool;
let appPool: Pool;
let app: import("express").Express;
let createSurchargeService: typeof import(
  "../../src/modules/charges/service.js"
).createSurchargeService;
let landlordToken: string;
let otherLandlordToken: string;

function scopedConnectionString(connectionString: string): string {
  const url = new URL(connectionString);
  const currentOptions = url.searchParams.get("options");
  const searchPathOption = `-c search_path=${schemaName}`;
  url.searchParams.set(
    "options",
    currentOptions
      ? `${currentOptions} ${searchPathOption}`
      : searchPathOption,
  );
  return url.toString();
}

function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

async function withSchemaClient<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await adminPool.connect();
  try {
    await client.query(`SET search_path TO ${quotedSchema}`);
    return await callback(client);
  } finally {
    client.release();
  }
}

async function createBillingSchema(): Promise<void> {
  await adminPool.query(`CREATE SCHEMA ${quotedSchema}`);
  await withSchemaClient(async (client) => {
    await client.query(`
      CREATE TYPE water_billing_method AS ENUM ('Metered', 'Flat');

      CREATE TABLE users (
        id uuid PRIMARY KEY,
        role text NOT NULL,
        username text NOT NULL,
        password_hash text NOT NULL,
        must_change_password boolean NOT NULL DEFAULT false,
        status text NOT NULL DEFAULT 'Active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE properties (
        id uuid PRIMARY KEY,
        landlord_id uuid NOT NULL,
        name text NOT NULL,
        address text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        deleted_by uuid
      );

      CREATE TABLE utility_rate_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id uuid NOT NULL,
        electricity_rate_per_kwh integer NOT NULL,
        water_billing_method water_billing_method NOT NULL,
        water_rate_per_m3 integer,
        water_flat_amount_per_tenant integer,
        effective_from date NOT NULL,
        created_by uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE surcharges (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id uuid NOT NULL,
        name text NOT NULL,
        monthly_amount integer NOT NULL DEFAULT 0,
        effective_from date NOT NULL,
        effective_to date,
        active boolean NOT NULL DEFAULT true,
        created_by uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        deleted_at timestamptz,
        deleted_by uuid
      );

      CREATE UNIQUE INDEX surcharges_name_active
        ON surcharges (property_id, name)
        WHERE deleted_at IS NULL AND active = true;

      CREATE TABLE audit_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_user_id uuid,
        action text NOT NULL,
        entity_type text NOT NULL,
        entity_id uuid NOT NULL,
        before_value text,
        after_value text,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);
  });
}

async function applyBillingMigration(): Promise<void> {
  const journalUrl = new URL(
    "../../src/db/migrations/meta/_journal.json",
    import.meta.url,
  );
  const journal = JSON.parse(
    await readFile(journalUrl, "utf8"),
  ) as { entries: Array<{ idx: number; tag: string }> };
  const migrationNames = journal.entries
    .filter((entry) => entry.idx > 0)
    .map((entry) => `${entry.tag}.sql`);

  for (const migrationName of migrationNames) {
    const migrationUrl = new URL(
      `../../src/db/migrations/${migrationName}`,
      import.meta.url,
    );
    const migration = (
      await readFile(migrationUrl, "utf8")
    ).replaceAll("--> statement-breakpoint", "");

    await withSchemaClient(async (client) => {
      await client.query(migration);
    });
  }
}

async function resetFixtures(): Promise<void> {
  await withSchemaClient(async (client) => {
    await client.query(
      "TRUNCATE audit_events, utility_rate_history, surcharges, properties, users",
    );
    await client.query(
      `INSERT INTO users (id, role, username, password_hash)
       VALUES ($1, 'Landlord', 'landlord-a', 'not-used'),
              ($2, 'Landlord', 'landlord-b', 'not-used')`,
      [LANDLORD_ID, OTHER_LANDLORD_ID],
    );
    await client.query(
      `INSERT INTO properties (id, landlord_id, name, address)
       VALUES ($1, $2, 'Property A', 'Address A')`,
      [PROPERTY_ID, LANDLORD_ID],
    );
  });
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
    await createBillingSchema();
    await applyBillingMigration();

    process.env.DATABASE_URL = scopedConnectionString(databaseUrl);
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
    if (adminPool) {
      await adminPool.query(`DROP SCHEMA IF EXISTS ${quotedSchema} CASCADE`);
      await adminPool.end();
    }
  });

  it("applies the generated migration as a non-unique partial index", async () => {
    const result = await adminPool.query<{
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
      [schemaName],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].indisunique).toBe(false);
    expect(result.rows[0].predicate).toContain("deleted_at IS NULL");
    expect(result.rows[0].predicate).toContain("active = true");
  });

  it("migrates audit snapshots from text to JSONB", async () => {
    const result = await adminPool.query<{ data_type: string }>(
      `
        SELECT data_type
        FROM information_schema.columns
        WHERE table_schema = $1
          AND table_name = 'audit_events'
          AND column_name IN ('before_value', 'after_value')
        ORDER BY column_name
      `,
      [schemaName],
    );

    expect(result.rows.map((row) => row.data_type)).toEqual([
      "jsonb",
      "jsonb",
    ]);
  });

  it("returns 404 when another landlord requests the property's rate", async () => {
    const response = await request(app)
      .get(`/api/v1/properties/${PROPERTY_ID}/utility-rates`)
      .set(auth(otherLandlordToken))
      .expect(404);

    expect(response.body.error).toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("rolls back a utility rate when its audit insert fails", async () => {
    await withSchemaClient(async (client) => {
      await client.query(`
        ALTER TABLE audit_events
        ADD CONSTRAINT reject_utility_rate_audit
        CHECK (action <> 'utility_rate.created')
      `);
    });

    try {
      await request(app)
        .post(`/api/v1/properties/${PROPERTY_ID}/utility-rates`)
        .set(auth(landlordToken))
        .send({
          electricityRatePerKwh: 3500,
          waterBillingMethod: "Metered",
          waterRatePerM3: 15000,
          effectiveFrom: "2026-07-01",
        })
        .expect(500);

      const result = await withSchemaClient((client) =>
        client.query(
          "SELECT count(*)::integer AS count FROM utility_rate_history",
        ),
      );
      expect(result.rows[0].count).toBe(0);
    } finally {
      await withSchemaClient(async (client) => {
        await client.query(`
          ALTER TABLE audit_events
          DROP CONSTRAINT IF EXISTS reject_utility_rate_audit
        `);
      });
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

    const result = await withSchemaClient((client) =>
      client.query(
        "SELECT count(*)::integer AS count FROM surcharges WHERE name = 'Internet'",
      ),
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

    const result = await withSchemaClient((client) =>
      client.query(
        "SELECT count(*)::integer AS count FROM surcharges WHERE name = 'Parking'",
      ),
    );
    expect(result.rows[0].count).toBe(1);
  });
});
