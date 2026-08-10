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
  TENANT_INFO_ID,
  TENANT_ROOM_ID,
  LEASE_ID,
  teardownIntegrationDatabase,
  type IntegrationHandles,
} from "./helpers/db.js";

const FIXTURE_PASSWORD = "Landlord123";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

const landlordToken = sign("Landlord");
const otherLandlordToken = sign("Landlord", OTHER_LANDLORD_ID);

beforeAll(async () => {
  handles = await setupIntegrationDatabase("tenants");
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
  await dbPool.query(
    `INSERT INTO tenant_info (id, full_name, phone, email, id_number, created_by_landlord_id)
     VALUES ($1, 'Nguyen Van C', '0902223333', 'tenant-c@example.com', '07911122233', $2)`,
    [TENANT_INFO_ID, LANDLORD_ID],
  );
  // The tenant must be reachable through the lease->room->property ownership
  // scope (US-TENANT-01). Use a dedicated room/lease so the lease tests,
  // which create their own leases for ROOM_ID, do not collide.
  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, base_rent)
     VALUES ($1, $2, 'Room 102', 3000000)`,
    [TENANT_ROOM_ID, PROPERTY_ID],
  );
  await dbPool.query(
    `INSERT INTO leases (id, room_id, tenant_info_id, start_date, end_date, agreed_rent, deposit, status, created_by)
     VALUES ($1, $2, $3, '2026-01-01', '2026-12-31', 3000000, 3000000, 'Active', $4)`,
    [LEASE_ID, TENANT_ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
  );
});

describe("Tenants (US-TENANT-01/02)", () => {
  it("lists tenants scoped to the owning landlord", async () => {
    const response = await request(app)
      .get("/api/v1/tenants")
      .set(auth(landlordToken))
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      id: TENANT_INFO_ID,
      fullName: "Nguyen Van C",
    });
  });

  it("gets a tenant by id for the owner", async () => {
    const response = await request(app)
      .get(`/api/v1/tenants/${TENANT_INFO_ID}`)
      .set(auth(landlordToken))
      .expect(200);

    expect(response.body.data).toMatchObject({ id: TENANT_INFO_ID });
  });

  it("returns 404 for a tenant owned by a different landlord", async () => {
    await request(app)
      .get(`/api/v1/tenants/${TENANT_INFO_ID}`)
      .set(auth(otherLandlordToken))
      .expect(404);
  });

  it("updates a tenant", async () => {
    const response = await request(app)
      .patch(`/api/v1/tenants/${TENANT_INFO_ID}`)
      .set(auth(landlordToken))
      .send({ fullName: "Nguyen Van C Updated" })
      .expect(200);

    expect(response.body.data.fullName).toBe("Nguyen Van C Updated");

    const audit = await dbPool.query(
      "SELECT action FROM audit_events WHERE action = 'tenant.updated' AND entity_id = $1",
      [TENANT_INFO_ID],
    );
    expect(audit.rows).toHaveLength(1);
  });

  it("archives a tenant (soft delete) and then 404s on lookup", async () => {
    await request(app)
      .delete(`/api/v1/tenants/${TENANT_INFO_ID}`)
      .set(auth(landlordToken))
      .expect(200);

    // Soft-deleted: direct GET returns 404.
    await request(app)
      .get(`/api/v1/tenants/${TENANT_INFO_ID}`)
      .set(auth(landlordToken))
      .expect(404);

    // Row still exists but is soft-deleted.
    const row = await dbPool.query<{ deleted_at: Date | null }>(
      "SELECT deleted_at FROM tenant_info WHERE id = $1",
      [TENANT_INFO_ID],
    );
    expect(row.rows[0]!.deleted_at).not.toBeNull();
  });

  it("rejects a tenant write from a non-Landlord role", async () => {
    const tenantToken = sign("Tenant", "55555555-5555-4555-8555-555555555555");
    await request(app)
      .get("/api/v1/tenants")
      .set(auth(tenantToken))
      .expect(403);
  });
});
