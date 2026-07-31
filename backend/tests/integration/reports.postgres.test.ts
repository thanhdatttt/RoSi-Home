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
const MAINT_ID = "22222222-2222-4222-8222-222222222222";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

beforeAll(async () => {
  handles = await setupIntegrationDatabase("reports");
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
     VALUES ($1, 'Landlord', 'landlord-rep@test.dev', $3),
            ($2, 'Tenant', 'tenant-rep@test.dev', $3)`,
    [LANDLORD_ID, TENANT_USER_ID, passwordHash],
  );

  await dbPool.query(
    `INSERT INTO tenant_info (id, user_id, created_by_landlord_id, full_name, phone, email, id_number)
     VALUES ($1, $2, $3, 'Tenant Rep', '0900000001', 'tenant-rep@test.dev', 'ID1')`,
    [TENANT_INFO_ID, TENANT_USER_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address, created_at, updated_at)
     VALUES ($1, $2, 'Test Property', '123 Main St', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')`,
    [PROPERTY_ID, LANDLORD_ID]
  );

  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, rent_price, size, max_occupants, status, created_at, updated_at)
     VALUES ($1, $2, 'Room 101', 5000000, 25, 2, 'Occupied', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')`,
    [ROOM_ID, PROPERTY_ID]
  );

  await dbPool.query(
    `INSERT INTO leases (id, room_id, tenant_info_id, start_date, end_date, agreed_rent, deposit, created_by, status)
     VALUES ($1, $2, $3, '2026-07-01', '2027-06-30', 5000000, 5000000, $4, 'Active')`,
    [LEASE_ID, ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO invoices (id, lease_id, room_id, billing_period, status, issue_date, due_date, total_amount)
     VALUES ($1, $2, $3, '2026-07', 'Paid', '2026-07-01', '2026-07-05', 5500000)`,
    [INVOICE_ID, LEASE_ID, ROOM_ID],
  );

  await dbPool.query(
    `INSERT INTO invoice_line_items (invoice_id, type, description, amount)
     VALUES ($1, 'Rent', 'Rent', 5000000),
            ($1, 'Water', 'Water', 200000),
            ($1, 'Electricity', 'Electricity', 200000),
            ($1, 'Maintenance', 'Maintenance Fee', 100000)`,
    [INVOICE_ID]
  );

  await dbPool.query(
    `INSERT INTO payments (id, invoice_id, amount, verified_by, verified_at)
     VALUES ('33333333-3333-4333-8333-333333333333', $1, 5500000, $2, '2026-07-04T10:00:00Z')`,
    [INVOICE_ID, LANDLORD_ID]
  );

  await dbPool.query(
    `INSERT INTO maintenance_requests (id, room_id, tenant_info_id, title, description, status, submitted_at, completed_at)
     VALUES ($1, $2, $3, 'Fix tap', 'Leaking', 'Completed', '2026-07-10T10:00:00Z', '2026-07-12T10:00:00Z')`,
    [MAINT_ID, ROOM_ID, TENANT_INFO_ID]
  );
});

describe("Reports Integration (US-REPORT-01 to 05)", () => {
  let reportId: string;

  it("generates a comprehensive monthly report from real database records", async () => {
    const res = await request(app)
      .post("/api/v1/reports/generate")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .send({
        periodType: "month",
        month: "2026-07"
      });
      if (res.status !== 200) console.error("GENERATE REPORT ERROR:", res.body);
    expect(res.status).toBe(200);

    const report = res.body.data;
    expect(report.period.type).toBe("month");
    expect(report.period.month).toBe("2026-07");
    
    // Financials
    expect(report.financial.expectedRevenue.rent).toBe(5000000);
    expect(report.financial.expectedRevenue.electricity).toBe(200000);
    expect(report.financial.expectedRevenue.water).toBe(200000);
    expect(report.financial.expectedRevenue.surcharges).toBe(100000);
    expect(report.financial.actualCollectedRevenue.rent).toBe(5000000);
    
    // Occupancy
    expect(report.occupancy.averageOccupancyRate).toBe(100);
    expect(report.occupancy.moveIns).toBe(1);
    expect(report.occupancy.moveOuts).toBe(0);

    // Maintenance
    expect(report.maintenance.newRequests).toBe(1);
    expect(report.maintenance.completedRequests).toBe(1);
    expect(report.maintenance.averageResolutionTime).toBeGreaterThan(0);

    reportId = report.reportId;
  });

  it("fails if month is invalid", async () => {
    const res = await request(app)
      .post("/api/v1/reports/generate")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .send({
        periodType: "month",
        month: "invalid-month"
      })
      .expect(400);
  });

  it("downloads the generated report as a PDF", async () => {
    // Generate first
    const genRes = await request(app)
      .post("/api/v1/reports/generate")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .send({
        periodType: "month",
        month: "2026-07"
      })
      .expect(200);

    const reportId = genRes.body.data.id;

    const pdfRes = await request(app)
      .get(`/api/v1/reports/${reportId}/pdf`)
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    expect(pdfRes.headers["content-type"]).toBe("application/pdf");
    expect(pdfRes.headers["content-disposition"]).toContain(`attachment; filename="report-2026-07`);
  });
});
