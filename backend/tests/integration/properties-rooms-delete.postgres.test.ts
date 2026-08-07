import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import {
  setupIntegrationDatabase,
  teardownIntegrationDatabase,
  resetCommonFixtures,
  sign,
  auth,
  LANDLORD_ID,
  PROPERTY_ID,
  ROOM_ID,
  type IntegrationHandles,
  OTHER_LANDLORD_ID,
  TENANT_INFO_ID,
  LEASE_ID,
} from "./helpers/db.js";

describe("Properties and Rooms Delete endpoints (PostgreSQL Integration)", () => {
  let handles: IntegrationHandles;
  const token = sign("Landlord", LANDLORD_ID);

  beforeAll(async () => {
    handles = await setupIntegrationDatabase("propsroomsdel");
  });

  afterAll(async () => {
    await teardownIntegrationDatabase(handles);
  });

  beforeEach(async () => {
    await resetCommonFixtures(handles.dbPool);
    // Seed Landlord
    await handles.dbPool.query(
      `INSERT INTO users (id, username, password_hash, role, created_at, updated_at) VALUES ($1, 'landlord@test.com', 'pass', 'Landlord', now(), now())`,
      [LANDLORD_ID],
    );
    // Seed Property
    await handles.dbPool.query(
      `INSERT INTO properties (id, landlord_id, name, address, created_at, updated_at) VALUES ($1, $2, 'Prop 1', 'Address 1', now(), now())`,
      [PROPERTY_ID, LANDLORD_ID],
    );
    // Seed Room
    await handles.dbPool.query(
      `INSERT INTO rooms (id, property_id, name, base_rent, created_at, updated_at) VALUES ($1, $2, 'Room 1', 1000, now(), now())`,
      [ROOM_ID, PROPERTY_ID],
    );
  });

  describe("DELETE /api/v1/properties/:id", () => {
    it("should softly delete a property if owned by the landlord", async () => {
      const res = await request(handles.app)
        .delete(`/api/v1/properties/${PROPERTY_ID}`)
        .set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);

      const dbRes = await handles.dbPool.query(
        `SELECT deleted_at FROM properties WHERE id = $1`,
        [PROPERTY_ID],
      );
      expect(dbRes.rows[0].deleted_at).not.toBeNull();
    });

    it("should return 404 if property not found or belongs to another landlord", async () => {
      const res = await request(handles.app)
        .delete(`/api/v1/properties/${PROPERTY_ID}`)
        .set(auth(sign("Landlord", OTHER_LANDLORD_ID)));
      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/v1/rooms/:id", () => {
    it("should softly delete a room if it is vacant", async () => {
      const res = await request(handles.app)
        .delete(`/api/v1/rooms/${ROOM_ID}`)
        .set(auth(token));
      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);

      const dbRes = await handles.dbPool.query(
        `SELECT deleted_at FROM rooms WHERE id = $1`,
        [ROOM_ID],
      );
      expect(dbRes.rows[0].deleted_at).not.toBeNull();
    });

    it("should return 409 if the room is occupied", async () => {
      // Seed Tenant Info and Lease
      await handles.dbPool.query(
        `INSERT INTO tenant_info (id, created_by_landlord_id, full_name, created_at, updated_at) VALUES ($1, $2, 'Tenant', now(), now())`,
        [TENANT_INFO_ID, LANDLORD_ID],
      );
      await handles.dbPool.query(
        `INSERT INTO leases (id, room_id, tenant_info_id, status, start_date, end_date, agreed_rent, created_by, created_at, updated_at) VALUES ($1, $2, $3, 'Active', '2020-01-01', '2030-01-01', 1000, $4, now(), now())`,
        [LEASE_ID, ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
      );

      const res = await request(handles.app)
        .delete(`/api/v1/rooms/${ROOM_ID}`)
        .set(auth(token));
      expect(res.status).toBe(409);
      expect(res.body.error.message).toContain("occupied room");
    });

    it("should return 404 if room not found or belongs to another landlord", async () => {
      const res = await request(handles.app)
        .delete(`/api/v1/rooms/${ROOM_ID}`)
        .set(auth(sign("Landlord", OTHER_LANDLORD_ID)));
      expect(res.status).toBe(404);
    });
  });
});
