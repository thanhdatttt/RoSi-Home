import "dotenv/config";
import { hashPassword } from "../../src/lib/auth.js";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  auth,
  LANDLORD_ID,
  TENANT_USER_ID,
  PROPERTY_ID,
  ROOM_ID,
  TENANT_INFO_ID,
  LEASE_ID,
  resetCommonFixtures,
  setupIntegrationDatabase,
  sign,
  teardownIntegrationDatabase,
  type IntegrationHandles,
} from "./helpers/db.js";

const INVOICE_ID = "11111111-1111-4111-8111-111111111111";
const INVOICE_2_ID = "22222222-2222-4222-8222-222222222222";
const PAYMENT_ID = "33333333-3333-4333-8333-333333333333";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

beforeAll(async () => {
  handles = await setupIntegrationDatabase("dashboard");
  dbPool = handles.dbPool;
  app = handles.app;
});

afterAll(async () => {
  await teardownIntegrationDatabase(handles);
});

beforeEach(async () => {
  const passwordHash = await hashPassword("Password123");
  await resetCommonFixtures(dbPool);
  
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
     VALUES ($1, 'Landlord', 'landlord-dash@test.dev', $3),
            ($2, 'Tenant', 'tenant-dash@test.dev', $3)`,
    [LANDLORD_ID, TENANT_USER_ID, passwordHash],
  );

  await dbPool.query(
    `INSERT INTO tenant_info (id, user_id, created_by_landlord_id, full_name, phone, email, id_number)
     VALUES ($1, $2, $3, 'Tenant Dash', '0900000002', 'tenant-dash@test.dev', 'ID2')`,
    [TENANT_INFO_ID, TENANT_USER_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address, created_at, updated_at)
     VALUES ($1, $2, 'Test Property Dash', '123 Dash St', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')`,
    [PROPERTY_ID, LANDLORD_ID]
  );

  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, base_rent, created_at, updated_at)
     VALUES ($1, $2, 'Room Dash 1', 5000000, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')`,
    [ROOM_ID, PROPERTY_ID]
  );

  // Active lease ending soon
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);

  await dbPool.query(
    `INSERT INTO leases (id, room_id, tenant_info_id, status, start_date, end_date, agreed_rent, deposit, created_by)
     VALUES ($1, $2, $3, 'Active', '2026-01-01', $4, 5000000, 5000000, $5)`,
    [LEASE_ID, ROOM_ID, TENANT_INFO_ID, nextWeek.toISOString().split("T")[0], LANDLORD_ID]
  );

  // Invoice 1: Overdue
  await dbPool.query(
    `INSERT INTO invoices (id, lease_id, room_id, billing_period, issue_date, due_date, total_amount, status)
     VALUES ($1, $2, $3, '2026-06', '2026-06-25', '2026-06-30', 5500000, 'Sent')`,
    [INVOICE_ID, LEASE_ID, ROOM_ID]
  );
  
  await dbPool.query(
    `INSERT INTO invoice_line_items (id, invoice_id, type, amount, description)
     VALUES (gen_random_uuid(), $1, 'Rent', 5000000, 'Rent June'),
            (gen_random_uuid(), $1, 'Electricity', 500000, 'Elec June')`,
    [INVOICE_ID]
  );

  // Invoice 2: Paid (Current month)
  await dbPool.query(
    `INSERT INTO invoices (id, lease_id, room_id, billing_period, issue_date, due_date, total_amount, status)
     VALUES ($1, $2, $3, '2026-07', '2026-07-25', '2026-07-31', 5200000, 'Paid')`,
    [INVOICE_2_ID, LEASE_ID, ROOM_ID]
  );

  await dbPool.query(
    `INSERT INTO invoice_line_items (id, invoice_id, type, amount, description)
     VALUES (gen_random_uuid(), $1, 'Rent', 5000000, 'Rent July'),
            (gen_random_uuid(), $1, 'Water', 200000, 'Water July')`,
    [INVOICE_2_ID]
  );

  // Payment for Invoice 2 in July
  await dbPool.query(
    `INSERT INTO payments (id, invoice_id, amount, verified_by, verified_at)
     VALUES ($1, $2, 5200000, $3, '2026-07-15T12:00:00Z')`,
    [PAYMENT_ID, INVOICE_2_ID, LANDLORD_ID]
  );
});

describe("Dashboard PostgreSQL Integration", () => {
  it("US-DASH-01: retrieves occupancy count", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/occupancy")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    const data = res.body.data;
    expect(data.totalRooms).toBe(1);
    expect(data.occupiedRooms).toBe(1);
  });

  it("US-DASH-02: retrieves monthly revenue summary", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/revenue?month=2026-07")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    const data = res.body.data;
    expect(data.month).toBe("2026-07");
    
    // 5M rent + 200k water expected in July (Invoice 2)
    expect(data.expectedRevenue).toBe(5200000);
    
    // Paid 5.2M in July
    expect(data.collectedRevenue).toBe(5200000);
  });

  it("US-DASH-03: retrieves outstanding invoices", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/outstanding")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    const data = res.body.data;
    // Only Invoice 1 (5.5M) is 'Sent' (outstanding)
    expect(data.outstandingTotal).toBe(5500000);
    
    // Assuming today > '2026-06-30', it should be overdue
    const isOverdue = new Date() > new Date("2026-06-30");
    if (isOverdue) {
      expect(data.overdueInvoices).toHaveLength(1);
      expect(data.overdueInvoices[0].amount).toBe(5500000);
      expect(data.overdueInvoices[0].tenant).toBe("Tenant Dash");
    } else {
      expect(data.overdueInvoices).toHaveLength(0);
    }
  });

  it("US-DASH-04: retrieves upcoming expirations", async () => {
    const res = await request(app)
      .get("/api/v1/dashboard/upcoming-expirations")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    const data = res.body.data;
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data[0].tenantFullName).toBe("Tenant Dash");
    expect(data[0].roomName).toBe("Room Dash 1");
  });
});
