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

const TEST_JWT_SECRET = "meters-invoices-postgres-integration-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const OTHER_LANDLORD_ID = "44444444-4444-4444-8444-444444444444";
const TENANT_USER_ID = "55555555-5555-4555-8555-555555555555";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
const ROOM_ID = "66666666-6666-4666-8666-666666666666";
const TENANT_INFO_ID = "77777777-7777-4777-8777-777777777777";
const LEASE_ID = "88888888-8888-4888-8888-888888888888";
const RATE_ID = "99999999-9999-4999-8999-999999999999";

// The generated migration hardcodes every foreign key to the "public"
// schema (drizzle-kit's default output), so a schema-per-test-run trick
// (`SET search_path`) doesn't cleanly isolate tests here. Instead each run
// gets its own disposable database, applied with the full, unmodified
// migration set — closer to production and free of "public"-qualification
// edge cases.
const databaseName = `meters_invoices_${randomUUID().replaceAll("-", "")}`;

let adminPool: Pool; // connected to the maintenance database, for CREATE/DROP DATABASE
let dbPool: Pool; // connected to the disposable per-run database
let appPool: Pool;
let app: import("express").Express;
let landlordToken: string;
let otherLandlordToken: string;
let tenantToken: string;

function withDatabaseName(connectionString: string, dbName: string): string {
  const url = new URL(connectionString);
  url.pathname = `/${dbName}`;
  return url.toString();
}

function auth(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

async function applyFullMigrations(): Promise<void> {
  const journalUrl = new URL(
    "../../src/db/migrations/meta/_journal.json",
    import.meta.url,
  );
  const journal = JSON.parse(await readFile(journalUrl, "utf8")) as {
    entries: Array<{ idx: number; tag: string }>;
  };

  for (const entry of journal.entries) {
    const migrationUrl = new URL(
      `../../src/db/migrations/${entry.tag}.sql`,
      import.meta.url,
    );
    const migration = (await readFile(migrationUrl, "utf8")).replaceAll(
      "--> statement-breakpoint",
      "",
    );
    await dbPool.query(migration);
  }
}

async function resetFixtures(): Promise<void> {
  await dbPool.query(
    "TRUNCATE audit_events, notifications, device_tokens, invoice_line_items, invoice_generation_skips, invoices, meter_readings, leases, tenant_info, utility_rate_history, rooms, properties, users RESTART IDENTITY CASCADE",
  );
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
     VALUES ($1, 'Landlord', 'landlord-a', 'not-used'),
            ($2, 'Landlord', 'landlord-b', 'not-used'),
            ($3, 'Tenant', 'tenant-a', 'not-used')`,
    [LANDLORD_ID, OTHER_LANDLORD_ID, TENANT_USER_ID],
  );
  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address)
     VALUES ($1, $2, 'Sunrise House', '123 Le Loi, District 1')`,
    [PROPERTY_ID, LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, base_rent)
     VALUES ($1, $2, 'Room 101', 3000000)`,
    [ROOM_ID, PROPERTY_ID],
  );
  await dbPool.query(
    `INSERT INTO tenant_info (id, full_name, phone, email, id_number, user_id, created_by_landlord_id)
     VALUES ($1, 'Nguyen Van A', '0900000000', 'tenant@example.com', '079123456789', $2, $3)`,
    [TENANT_INFO_ID, TENANT_USER_ID, LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO leases (id, room_id, tenant_info_id, start_date, end_date, agreed_rent, deposit, status, created_by)
     VALUES ($1, $2, $3, '2026-01-01', '2026-12-31', 3000000, 3000000, 'Active', $4)`,
    [LEASE_ID, ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO utility_rate_history
       (id, property_id, electricity_rate_per_kwh, water_billing_method, water_rate_per_m3, effective_from, created_by)
     VALUES ($1, $2, 3500, 'Metered', 15000, '2026-01-01', $3)`,
    [RATE_ID, PROPERTY_ID, LANDLORD_ID],
  );
}

function recordReading(
  token: string,
  roomId: string,
  body: Record<string, unknown>,
) {
  return request(app)
    .post(`/api/v1/rooms/${roomId}/meter-readings`)
    .set(auth(token))
    .send(body);
}

describe("Meters + Invoices PostgreSQL integration", () => {
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
    await applyFullMigrations();

    process.env.DATABASE_URL = scopedUrl;
    process.env.JWT_SECRET = TEST_JWT_SECRET;

    const [{ createApp }, dbModule] = await Promise.all([
      import("../../src/app.js"),
      import("../../src/db/index.js"),
    ]);
    app = createApp();
    appPool = dbModule.pool;

    landlordToken = jwt.sign(
      { sub: LANDLORD_ID, role: "Landlord", mustChangePassword: false },
      TEST_JWT_SECRET,
      { expiresIn: "1h" },
    );
    otherLandlordToken = jwt.sign(
      { sub: OTHER_LANDLORD_ID, role: "Landlord", mustChangePassword: false },
      TEST_JWT_SECRET,
      { expiresIn: "1h" },
    );
    tenantToken = jwt.sign(
      { sub: TENANT_USER_ID, role: "Tenant", mustChangePassword: false },
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

  it("US-METER-01: records an initial baseline reading with no consumption or charge", async () => {
    const response = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      isInitial: true,
      previousValue: null,
      consumption: null,
      amount: 0,
    });
  });

  it("US-METER-01: rejects a duplicate reading for the same room/utility/period", async () => {
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);

    const response = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 110,
      isInitial: false,
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("US-METER-01: a landlord cannot record a reading for a room they don't own", async () => {
    const response = await recordReading(otherLandlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    });

    expect(response.status).toBe(404);
  });

  it("US-METER-02: calculates consumption and charge against the landlord's own rate", async () => {
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);

    const response = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      previousValue: 100,
      consumption: 50,
      unitRate: 3500,
      amount: 175000,
      rateSource: "landlord",
    });
  });

  it("US-METER-02: rejects a reading lower than the previous reading", async () => {
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);

    const response = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 80,
      isInitial: false,
    });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("UNPROCESSABLE");
  });

  it("US-INVOICE-01 end-to-end: generates a Draft invoice with itemized rent + electricity + water", async () => {
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-06",
      value: 10,
      isInitial: true,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-07",
      value: 15,
      isInitial: false,
    }).expect(201);

    const generateResponse = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set(auth(landlordToken))
      .query({ period: "2026-07" });

    expect(generateResponse.status).toBe(200);
    expect(generateResponse.body.data).toEqual({ generated: 1, skipped: 0 });

    const listResult = await dbPool.query<{ id: string; status: string; total_amount: number }>(
        "SELECT id, status, total_amount FROM invoices WHERE room_id = $1 AND billing_period = $2",
        [ROOM_ID, "2026-07"],
      );
    expect(listResult.rows).toHaveLength(1);
    const invoice = listResult.rows[0]!;
    expect(invoice.status).toBe("Draft");
    // rent 3,000,000 + electricity 50 kWh * 3,500 + water 5 m3 * 15,000
    expect(invoice.total_amount).toBe(3000000 + 175000 + 75000);

    // Re-running generation for the same period must not duplicate.
    const secondRun = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set(auth(landlordToken))
      .query({ period: "2026-07" });
    expect(secondRun.body.data).toEqual({ generated: 0, skipped: 0 });

    // US-INVOICE-02: the Tenant cannot see this invoice while it's Draft.
    const tenantView = await request(app)
      .get(`/api/v1/invoices/${invoice.id}`)
      .set(auth(tenantToken));
    expect(tenantView.status).toBe(404);

    // The owning Landlord can see it.
    const landlordView = await request(app)
      .get(`/api/v1/invoices/${invoice.id}`)
      .set(auth(landlordToken));
    expect(landlordView.status).toBe(200);
    expect(landlordView.body.data.lineItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "rent", amount: 3000000 }),
        expect.objectContaining({ type: "electricity", amount: 175000 }),
        expect.objectContaining({ type: "water", amount: 75000 }),
      ]),
    );

    // A different landlord cannot see it.
    const otherLandlordView = await request(app)
      .get(`/api/v1/invoices/${invoice.id}`)
      .set(auth(otherLandlordToken));
    expect(otherLandlordView.status).toBe(404);

    // US-INVOICE-04: send it.
    const sendResponse = await request(app)
      .post(`/api/v1/invoices/${invoice.id}/send`)
      .set(auth(landlordToken));
    expect(sendResponse.status).toBe(200);
    expect(sendResponse.body.data.status).toBe("Sent");

    // Sending again is rejected.
    const resend = await request(app)
      .post(`/api/v1/invoices/${invoice.id}/send`)
      .set(auth(landlordToken));
    expect(resend.status).toBe(422);

    // US-INVOICE-02/03: now the Tenant can view and download it.
    const tenantViewAfterSend = await request(app)
      .get(`/api/v1/invoices/${invoice.id}`)
      .set(auth(tenantToken));
    expect(tenantViewAfterSend.status).toBe(200);
    expect(tenantViewAfterSend.body.data.status).toBe("Sent");

    const pdfResponse = await request(app)
      .get(`/api/v1/invoices/${invoice.id}/pdf`)
      .set(auth(tenantToken));
    expect(pdfResponse.status).toBe(200);
    expect(pdfResponse.headers["content-type"]).toContain("application/pdf");

    // A notification row was created for the tenant.
    const notifications = await dbPool.query(
        "SELECT type FROM notifications WHERE user_id = $1 AND type = 'invoice.sent'",
        [TENANT_USER_ID],
      );
    expect(notifications.rows).toHaveLength(1);
  });

  it("US-INVOICE-01: skips generation and records a reason when the electricity reading is missing", async () => {
    // Only a water reading is recorded; electricity is required and missing.
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-06",
      value: 10,
      isInitial: true,
    }).expect(201);

    const response = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set(auth(landlordToken))
      .query({ period: "2026-07" });

    expect(response.body.data).toEqual({ generated: 0, skipped: 1 });

    const skips = await dbPool.query<{ reason: string }>(
        "SELECT reason FROM invoice_generation_skips WHERE lease_id = $1 AND billing_period = $2",
        [LEASE_ID, "2026-07"],
      );
    expect(skips.rows).toHaveLength(1);
    expect(skips.rows[0]!.reason).toContain("electricity");
  });

  it("US-METER-03: correcting a reading recalculates the still-Draft invoice", async () => {
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-06",
      value: 10,
      isInitial: true,
    }).expect(201);
    const julyElectricity = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-07",
      value: 15,
      isInitial: false,
    }).expect(201);

    await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set(auth(landlordToken))
      .query({ period: "2026-07" })
      .expect(200);

    const invoiceRow = await dbPool.query<{ id: string; total_amount: number }>(
        "SELECT id, total_amount FROM invoices WHERE room_id = $1 AND billing_period = $2",
        [ROOM_ID, "2026-07"],
      );
    const invoiceId = invoiceRow.rows[0]!.id;
    expect(invoiceRow.rows[0]!.total_amount).toBe(3000000 + 175000 + 75000);

    // Correct the electricity reading from 150 -> 160 (consumption 50 -> 60).
    const correction = await request(app)
      .post(`/api/v1/meter-readings/${julyElectricity.body.data.id}/correct`)
      .set(auth(landlordToken))
      .send({ value: 160 });
    expect(correction.status).toBe(200);
    expect(correction.body.data).toMatchObject({ consumption: 60 });

    const recalculated = await dbPool.query<{ total_amount: number }>(
        "SELECT total_amount FROM invoices WHERE id = $1",
        [invoiceId],
      );
    // rent 3,000,000 + electricity 60 kWh * 3,500 (210,000) + water 75,000
    expect(recalculated.rows[0]!.total_amount).toBe(3000000 + 210000 + 75000);

    // Send it, then confirm a further correction is refused.
    await request(app)
      .post(`/api/v1/invoices/${invoiceId}/send`)
      .set(auth(landlordToken))
      .expect(200);

    const blockedCorrection = await request(app)
      .post(`/api/v1/meter-readings/${julyElectricity.body.data.id}/correct`)
      .set(auth(landlordToken))
      .send({ value: 170 });
    expect(blockedCorrection.status).toBe(422);
  });

  it("US-INVOICE-01/US-METER-01: flat-per-tenant water billing does not require a water meter reading", async () => {
    await dbPool.query(
        `UPDATE utility_rate_history
         SET water_billing_method = 'Flat', water_rate_per_m3 = NULL, water_flat_amount_per_tenant = 100000
         WHERE id = $1`,
        [RATE_ID],
      );

    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-06",
      value: 100,
      isInitial: true,
    }).expect(201);
    await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Electricity",
      billingPeriod: "2026-07",
      value: 150,
      isInitial: false,
    }).expect(201);

    // Attempting a water reading on a flat-billed property is rejected.
    const rejectedWaterReading = await recordReading(landlordToken, ROOM_ID, {
      utilityType: "Water",
      billingPeriod: "2026-07",
      value: 10,
      isInitial: true,
    });
    expect(rejectedWaterReading.status).toBe(422);

    const response = await request(app)
      .post(`/api/v1/properties/${PROPERTY_ID}/invoices/generate`)
      .set(auth(landlordToken))
      .query({ period: "2026-07" });

    expect(response.body.data).toEqual({ generated: 1, skipped: 0 });

    const invoiceRow = await dbPool.query<{ total_amount: number }>(
        "SELECT total_amount FROM invoices WHERE room_id = $1 AND billing_period = $2",
        [ROOM_ID, "2026-07"],
      );
    // rent 3,000,000 + electricity 175,000 + flat water 100,000 (1 tenant)
    expect(invoiceRow.rows[0]!.total_amount).toBe(3000000 + 175000 + 100000);
  });
});
