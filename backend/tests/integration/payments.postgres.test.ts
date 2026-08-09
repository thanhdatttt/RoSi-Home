import "dotenv/config";
import { hashPassword } from "../../src/lib/auth.js";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
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
import { uploadPaymentProof } from "../../src/lib/storage.js";

vi.mock("../../src/lib/storage.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../src/lib/storage.js")>();
  return {
    ...actual,
    uploadPaymentProof: vi.fn(async (input) => ({
      objectPath: input.objectPath,
      fileUrl: `payment-proofs/${input.objectPath}`,
    })),
<<<<<<< HEAD
    createSignedPaymentProofUrl: vi.fn(async (fileUrl: string) => `https://storage.test/${fileUrl}`),
=======
>>>>>>> origin/main
  };
});

const INVOICE_ID = "11111111-1111-4111-8111-111111111111";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

beforeAll(async () => {
  handles = await setupIntegrationDatabase("payments");
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
     VALUES ($1, 'Landlord', 'landlord-pay@test.dev', $3),
            ($2, 'Tenant', 'tenant-pay@test.dev', $3)`,
    [LANDLORD_ID, TENANT_USER_ID, passwordHash],
  );

  await dbPool.query(
    `INSERT INTO tenant_info (id, user_id, created_by_landlord_id, full_name, phone, email, id_number)
     VALUES ($1, $2, $3, 'Tenant Pay', '0900000001', 'tenant-pay@test.dev', 'ID1')`,
    [TENANT_INFO_ID, TENANT_USER_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address)
     VALUES ($1, $2, 'Prop A', 'Add A')`,
    [PROPERTY_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, base_rent)
     VALUES ($1, $2, 'Room 1', 5000000)`,
    [ROOM_ID, PROPERTY_ID],
  );

  await dbPool.query(
    `INSERT INTO leases (id, room_id, tenant_info_id, start_date, end_date, agreed_rent, deposit, created_by, status)
     VALUES ($1, $2, $3, '2025-01-01', '2025-12-31', 5000000, 5000000, $4, 'Active')`,
    [LEASE_ID, ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
  );

  await dbPool.query(
    `INSERT INTO invoices (id, lease_id, room_id, billing_period, status, issue_date, due_date, total_amount)
     VALUES ($1, $2, $3, '2025-01', 'Sent', '2025-01-01', '2025-01-05', 5500000)`,
    [INVOICE_ID, LEASE_ID, ROOM_ID],
  );
  
  vi.clearAllMocks();
});

describe("Payments & VietQR (US-VIETQR, US-PAYMENT)", () => {
  it("allows landlord to configure payment details", async () => {
    const res = await request(app)
      .put("/api/v1/payment-config")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .send({
        bankCode: "VCB",
        accountNumber: "123456789",
        accountHolderName: "NGUYEN VAN A",
      })
      .expect(200);

    expect(res.body.data.bankCode).toBe("VCB");
  });

  it("generates a VietQR for an invoice", async () => {
    // Need config first
    await dbPool.query(
      `INSERT INTO landlord_payment_configs (landlord_id, bank_code, account_number, account_holder_name)
<<<<<<< HEAD
       VALUES ($1, 'VCB', '12345', 'AN')`,
=======
       VALUES ($1, 'VCB', '123', 'A')`,
>>>>>>> origin/main
      [LANDLORD_ID]
    );

    const res = await request(app)
      .get(`/api/v1/invoices/${INVOICE_ID}/vietqr`)
      .set(auth(sign("Tenant", TENANT_USER_ID)))
      .expect(200);

    expect(res.body.data).toHaveProperty("payload");
    expect(res.body.data).toHaveProperty("imageUrl");
    expect(res.body.data.amount).toBe(5500000);
  });

  it("allows tenant to upload payment proof", async () => {
    const res = await request(app)
      .post(`/api/v1/invoices/${INVOICE_ID}/payment-proofs`)
      .set(auth(sign("Tenant", TENANT_USER_ID)))
<<<<<<< HEAD
      .attach(
        "proof",
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]),
        "test.png",
      )
=======
      .attach("proof", Buffer.from("fake-image"), "test.png")
>>>>>>> origin/main
      .expect(201);

    expect(res.body.data.status).toBe("Pending");
    expect(uploadPaymentProof).toHaveBeenCalled();
  });

  it("allows landlord to see pending proofs and confirm payment", async () => {
    // Insert a proof
    await dbPool.query(
      `INSERT INTO payment_proofs (id, invoice_id, tenant_info_id, file_url, status)
       VALUES ('22222222-2222-4222-8222-222222222222', $1, $2, 'test.png', 'Pending')`,
      [INVOICE_ID, TENANT_INFO_ID]
    );

    // Get pending proofs
    const listRes = await request(app)
      .get("/api/v1/payment-proofs")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    expect(listRes.body.data.length).toBe(1);
    expect(listRes.body.data[0].invoiceId).toBe(INVOICE_ID);

    // Confirm
    const confirmRes = await request(app)
      .post(`/api/v1/invoices/${INVOICE_ID}/confirm-payment`)
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    expect(confirmRes.body.data.amount).toBe(5500000);

    // Invoice status should be Paid
    const invStatus = await dbPool.query(`SELECT status FROM invoices WHERE id = $1`, [INVOICE_ID]);
    expect(invStatus.rows[0].status).toBe("Paid");
  });

  it("allows landlord to view payment history", async () => {
    const res = await request(app)
      .get("/api/v1/payments/history")
      .set(auth(sign("Landlord", LANDLORD_ID)))
      .expect(200);

    // Invoice is Sent, not paid yet
    expect(res.body.data.entries.length).toBe(1);
    expect(res.body.data.outstandingTotal).toBe(5500000);
  });
});
