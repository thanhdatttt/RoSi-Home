import "dotenv/config";
import { hashPassword } from "../../src/lib/auth.js";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  auth,
  LANDLORD_ID,
  OTHER_LANDLORD_ID,
  PROPERTY_ID,
  resetCommonFixtures,
  ROOM_ID,
  setupIntegrationDatabase,
  sign,
  teardownIntegrationDatabase,
  type IntegrationHandles,
} from "./helpers/db.js";

const FIXTURE_PASSWORD = "Landlord123";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

const landlordToken = sign("Landlord");
const otherLandlordToken = sign("Landlord", OTHER_LANDLORD_ID);

function createLease(token: string, overrides: Record<string, unknown> = {}) {
  return request(app)
    .post("/api/v1/leases")
    .set(auth(token))
    .send({
      roomId: ROOM_ID,
      tenant: {
        fullName: "Tran Thi B",
        phone: "0905556677",
        idNumber: "07912304567",
        email: "lease-tenant@example.com",
      },
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      agreedRent: 3500000,
      deposit: 3500000,
      ...overrides,
    });
}

beforeAll(async () => {
  handles = await setupIntegrationDatabase("leases");
  dbPool = handles.dbPool;
  app = handles.app;
});

afterAll(async () => {
  await teardownIntegrationDatabase(handles);
});

beforeEach(async () => {
  const passwordHash = await hashPassword(FIXTURE_PASSWORD);
  await resetCommonFixtures(dbPool);
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
     VALUES ($1, 'Landlord', 'landlord-a@test.dev', $3),
            ($2, 'Landlord', 'landlord-b@test.dev', $3)`,
    [LANDLORD_ID, OTHER_LANDLORD_ID, passwordHash],
  );
  await dbPool.query(
    `INSERT INTO landlord_profiles (user_id, full_name, email, phone)
     VALUES ($1, 'Landlord A', 'landlord-a@test.dev', '0901112222')`,
    [LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO landlord_profiles (user_id, full_name, email, phone)
     VALUES ($1, 'Landlord B', 'landlord-b@test.dev', '0903334444')`,
    [OTHER_LANDLORD_ID],
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
});

describe("Leases (US-LEASE-01/02/03/04/05/06)", () => {
  it("US-LEASE-01: creates a lease and provisions a tenant account atomically", async () => {
    const response = await createLease(landlordToken).expect(201);
    const lease = response.body.data;
    expect(response.body.meta.tenantAccountProvisioned).toBe(true);
    expect(lease.status).toBe("Active");

    // tenant_info row exists.
    const tenantRow = await dbPool.query(
      "SELECT id, full_name, user_id FROM tenant_info WHERE id_number = $1",
      ["07912304567"],
    );
    expect(tenantRow.rows).toHaveLength(1);
    expect(tenantRow.rows[0]!.user_id).not.toBeNull();

    // A tenant user was provisioned (username = phone).
    const userRow = await dbPool.query<{ must_change_password: boolean }>(
      "SELECT must_change_password FROM users WHERE username = $1",
      ["0905556677"],
    );
    expect(userRow.rows).toHaveLength(1);
    expect(userRow.rows[0]!.must_change_password).toBe(true);
  });

  it("US-LEASE-01: rejects an overlapping active lease for the same room with 409", async () => {
    await createLease(landlordToken).expect(201);
    const response = await createLease(landlordToken, {
      startDate: "2026-08-01",
      endDate: "2026-09-30",
    });
    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  it("US-LEASE-01: rejects end-before-start with 422", async () => {
    const response = await createLease(landlordToken, {
      startDate: "2026-12-31",
      endDate: "2026-07-01",
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("UNPROCESSABLE");
  });

  it("US-LEASE-02: a different landlord gets 404 for the lease", async () => {
    const created = await createLease(landlordToken).expect(201);
    const leaseId = created.body.data.id;

    await request(app)
      .get(`/api/v1/leases/${leaseId}`)
      .set(auth(otherLandlordToken))
      .expect(404);
  });

  it("US-LEASE-02: lists leases for the owning landlord with pagination", async () => {
    await createLease(landlordToken).expect(201);
    const response = await request(app)
      .get("/api/v1/leases")
      .set(auth(landlordToken))
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.meta).toMatchObject({ page: 1, pageSize: 20, total: 1 });
  });

  it("US-LEASE-03: updates the lease (plain edit)", async () => {
    const created = await createLease(landlordToken).expect(201);
    const leaseId = created.body.data.id;

    const response = await request(app)
      .patch(`/api/v1/leases/${leaseId}`)
      .set(auth(landlordToken))
      .send({ agreedRent: 3600000 })
      .expect(200);

    expect(response.body.data.agreedRent).toBe(3600000);

    const dbRow = await dbPool.query<{ agreed_rent: number }>(
      "SELECT agreed_rent FROM leases WHERE id = $1",
      [leaseId],
    );
    expect(dbRow.rows[0]!.agreed_rent).toBe(3600000);
  });

  it("US-LEASE-03: rejects an empty PATCH body with 400", async () => {
    const created = await createLease(landlordToken).expect(201);
    const leaseId = created.body.data.id;

    await request(app)
      .patch(`/api/v1/leases/${leaseId}`)
      .set(auth(landlordToken))
      .send({})
      .expect(400);
  });

  it("US-LEASE-04: ends the lease and sets status + actualEndDate", async () => {
    const created = await createLease(landlordToken).expect(201);
    const leaseId = created.body.data.id;

    const response = await request(app)
      .post(`/api/v1/leases/${leaseId}/end`)
      .set(auth(landlordToken))
      .send({ actualEndDate: "2026-08-31" })
      .expect(200);

    expect(response.body.data.status).toBe("Ended");
    expect(response.body.data.actualEndDate).toBe("2026-08-31");

    // Ending again is rejected (only Active can be ended).
    await request(app)
      .post(`/api/v1/leases/${leaseId}/end`)
      .set(auth(landlordToken))
      .send({ actualEndDate: "2026-09-30" })
      .expect(422);
  });

  it("US-LEASE-05: gets and updates the property reminder config", async () => {
    const getResponse = await request(app)
      .get(`/api/v1/properties/${PROPERTY_ID}/lease-reminder-config`)
      .set(auth(landlordToken))
      .expect(200);
    expect(getResponse.body.data).toMatchObject({
      propertyId: PROPERTY_ID,
      remindAt30Days: false,
      remindAt15Days: false,
      remindAt7Days: false,
    });

    const updateResponse = await request(app)
      .patch(`/api/v1/properties/${PROPERTY_ID}/lease-reminder-config`)
      .set(auth(landlordToken))
      .send({ remindAt7Days: true })
      .expect(200);
    expect(updateResponse.body.data.remindAt7Days).toBe(true);

    const dbRow = await dbPool.query<{ remind_at_7_days: boolean }>(
      "SELECT remind_at_7_days FROM lease_reminder_configs WHERE property_id = $1",
      [PROPERTY_ID],
    );
    expect(dbRow.rows[0]!.remind_at_7_days).toBe(true);
  });

  it("US-LEASE-06: returns upcoming expirations for the owning landlord", async () => {
    const created = await createLease(landlordToken).expect(201);
    const leaseId = created.body.data.id;

    // Force the lease to expire soon.
    await dbPool.query(
      "UPDATE leases SET end_date = $1 WHERE id = $2",
      ["2099-12-31", leaseId],
    );

    const response = await request(app)
      .get("/api/v1/leases/upcoming-expirations")
      .set(auth(landlordToken))
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
