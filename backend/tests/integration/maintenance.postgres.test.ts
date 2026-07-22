import "dotenv/config";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  auth,
  LANDLORD_ID,
  LEASE_ID,
  OTHER_LANDLORD_ID,
  PROPERTY_ID,
  resetCommonFixtures,
  ROOM_ID,
  setupIntegrationDatabase,
  sign,
  teardownIntegrationDatabase,
  TENANT_INFO_ID,
  TENANT_USER_ID,
  type IntegrationHandles,
} from "./helpers/db.js";

const OTHER_PROPERTY_ID = "22222222-2222-4222-8222-222222222223";
const OTHER_ROOM_ID = "66666666-6666-4666-8666-666666666668";
const OTHER_TENANT_USER_ID = "55555555-5555-4555-8555-555555555556";
const OTHER_TENANT_INFO_ID = "77777777-7777-4777-8777-777777777778";
const OWN_REQUEST_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const OWN_REQUEST_2_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const OTHER_REQUEST_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const storageMocks = vi.hoisted(() => ({
  uploadMaintenancePhoto: vi.fn(),
  deleteMaintenancePhoto: vi.fn(),
  createSignedMaintenancePhotoUrl: vi.fn(),
}));

vi.mock("../../src/lib/storage.js", () => ({
  uploadMaintenancePhoto: storageMocks.uploadMaintenancePhoto,
  deleteMaintenancePhoto: storageMocks.deleteMaintenancePhoto,
  createSignedMaintenancePhotoUrl: storageMocks.createSignedMaintenancePhotoUrl,
}));

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;
const tenantToken = sign("Tenant", TENANT_USER_ID);

function submit(roomId = ROOM_ID) {
  return request(app)
    .post("/api/v1/maintenance-requests")
    .set(auth(tenantToken))
    .field("roomId", roomId)
    .field("title", "Leaking sink")
    .field("description", "Water is leaking continuously below the sink.");
}

beforeAll(async () => {
  handles = await setupIntegrationDatabase("maintenance");
  dbPool = handles.dbPool;
  app = handles.app;
});

afterAll(async () => {
  await teardownIntegrationDatabase(handles);
});

beforeEach(async () => {
  vi.clearAllMocks();
  storageMocks.uploadMaintenancePhoto.mockImplementation(
    async (input: { objectPath: string }) => ({
      objectPath: input.objectPath,
      fileUrl: `maintenance-photos/${input.objectPath}`,
    }),
  );
  storageMocks.deleteMaintenancePhoto.mockResolvedValue(undefined);
  storageMocks.createSignedMaintenancePhotoUrl.mockImplementation(
    async (fileUrl: string) => `https://storage.test/signed/${encodeURIComponent(fileUrl)}`,
  );

  await resetCommonFixtures(dbPool);
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
     VALUES ($1, 'Landlord', 'landlord-a@test.dev', 'hash'),
            ($2, 'Landlord', 'landlord-b@test.dev', 'hash'),
            ($3, 'Tenant', '0905556677', 'hash'),
            ($4, 'Tenant', '0905556688', 'hash')`,
    [LANDLORD_ID, OTHER_LANDLORD_ID, TENANT_USER_ID, OTHER_TENANT_USER_ID],
  );
  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address)
     VALUES ($1, $2, 'Sunrise House', '123 Le Loi'),
            ($3, $4, 'Other House', '999 Nguyen Hue')`,
    [PROPERTY_ID, LANDLORD_ID, OTHER_PROPERTY_ID, OTHER_LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO rooms (id, property_id, name, base_rent)
     VALUES ($1, $2, 'Room 101', 3000000),
            ($3, $4, 'Other Room', 3000000)`,
    [ROOM_ID, PROPERTY_ID, OTHER_ROOM_ID, OTHER_PROPERTY_ID],
  );
  await dbPool.query(
    `INSERT INTO tenant_info
       (id, full_name, phone, email, id_number, user_id, created_by_landlord_id)
     VALUES ($1, 'Tran Thi B', '0905556677', 'tenant@test.dev', '07912304567', $2, $3),
            ($4, 'Nguyen Van C', '0905556688', 'other-tenant@test.dev', '07912304568', $5, $6)`,
    [
      TENANT_INFO_ID,
      TENANT_USER_ID,
      LANDLORD_ID,
      OTHER_TENANT_INFO_ID,
      OTHER_TENANT_USER_ID,
      OTHER_LANDLORD_ID,
    ],
  );
  await dbPool.query(
    `INSERT INTO leases
       (id, room_id, tenant_info_id, start_date, end_date, agreed_rent, deposit, status, created_by)
     VALUES ($1, $2, $3, '2020-01-01', '2099-12-31', 3000000, 3000000, 'Active', $4)`,
    [LEASE_ID, ROOM_ID, TENANT_INFO_ID, LANDLORD_ID],
  );
});

async function seedSubmittedRequests(): Promise<void> {
  await dbPool.query(
    `INSERT INTO maintenance_requests
       (id, room_id, tenant_info_id, title, description, status, submitted_at)
     VALUES
       ($1, $2, $3, 'Leaking sink', 'Water is leaking continuously.', 'InProgress', '2026-07-22T02:00:00.000Z'),
       ($4, $2, $3, 'Broken light', 'The ceiling light no longer works.', 'Pending', '2026-07-22T03:00:00.000Z'),
       ($5, $6, $7, 'Other tenant secret', 'Must not be exposed.', 'Completed', '2026-07-22T04:00:00.000Z')`,
    [
      OWN_REQUEST_ID,
      ROOM_ID,
      TENANT_INFO_ID,
      OWN_REQUEST_2_ID,
      OTHER_REQUEST_ID,
      OTHER_ROOM_ID,
      OTHER_TENANT_INFO_ID,
    ],
  );
  await dbPool.query(
    `INSERT INTO maintenance_photos (id, request_id, file_url)
     VALUES
       ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', $1, 'maintenance-photos/tenant/own-photo.png'),
       ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', $2, 'maintenance-photos/other/secret-photo.png')`,
    [OWN_REQUEST_ID, OTHER_REQUEST_ID],
  );
}

describe("Maintenance submission (US-MAINT-01)", () => {
  it("persists the request, photos, audit, and owner notification", async () => {
    const response = await submit()
      .attach("photos", png, { filename: "issue.png", contentType: "image/png" })
      .attach("photos", png, { filename: "detail.png", contentType: "image/png" })
      .expect(201);

    expect(response.body.data).toMatchObject({
      roomId: ROOM_ID,
      tenantInfoId: TENANT_INFO_ID,
      status: "Pending",
      title: "Leaking sink",
    });
    expect(response.body.data.photos).toHaveLength(2);

    const requestRows = await dbPool.query(
      `SELECT room_id, tenant_info_id, status, submitted_at
       FROM maintenance_requests WHERE id = $1`,
      [response.body.data.id],
    );
    expect(requestRows.rows).toHaveLength(1);
    expect(requestRows.rows[0]).toMatchObject({
      room_id: ROOM_ID,
      tenant_info_id: TENANT_INFO_ID,
      status: "Pending",
    });
    expect(requestRows.rows[0]!.submitted_at).not.toBeNull();

    const photoRows = await dbPool.query(
      "SELECT file_url FROM maintenance_photos WHERE request_id = $1",
      [response.body.data.id],
    );
    expect(photoRows.rows).toHaveLength(2);

    const auditRows = await dbPool.query(
      "SELECT actor_user_id, action FROM audit_events WHERE entity_id = $1",
      [response.body.data.id],
    );
    expect(auditRows.rows).toEqual([
      { actor_user_id: TENANT_USER_ID, action: "maintenance_request.created" },
    ]);

    const notifications = await dbPool.query(
      "SELECT user_id, type, link_ref FROM notifications",
    );
    expect(notifications.rows).toEqual([
      {
        user_id: LANDLORD_ID,
        type: "maintenance.created",
        link_ref: `maintenance:${response.body.data.id}`,
      },
    ]);
  });

  it("rejects spoofed image bytes before storage or database writes", async () => {
    const response = await submit()
      .attach("photos", Buffer.from("not an image"), {
        filename: "fake.png",
        contentType: "image/png",
      })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(storageMocks.uploadMaintenancePhoto).not.toHaveBeenCalled();
    const rows = await dbPool.query("SELECT id FROM maintenance_requests");
    expect(rows.rows).toHaveLength(0);
  });

  it("returns scoped 404 and writes no object for a room outside the tenant lease", async () => {
    const response = await submit(OTHER_ROOM_ID)
      .attach("photos", png, { filename: "issue.png", contentType: "image/png" })
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
    expect(storageMocks.uploadMaintenancePhoto).not.toHaveBeenCalled();
    const rows = await dbPool.query("SELECT id FROM maintenance_requests");
    expect(rows.rows).toHaveLength(0);
  });

  it("rejects a lease that is no longer Active", async () => {
    await dbPool.query("UPDATE leases SET status = 'Ended' WHERE id = $1", [LEASE_ID]);

    await submit().expect(404);
    expect(storageMocks.uploadMaintenancePhoto).not.toHaveBeenCalled();
  });

  it("rolls back request/audit rows and removes storage objects when photo persistence fails", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await dbPool.query(`
      CREATE FUNCTION fail_maintenance_photo_insert() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'forced maintenance photo failure';
      END;
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER maintenance_photo_failure
      BEFORE INSERT ON maintenance_photos
      FOR EACH ROW EXECUTE FUNCTION fail_maintenance_photo_insert();
    `);

    try {
      await submit()
        .attach("photos", png, { filename: "issue.png", contentType: "image/png" })
        .expect(500);

      const [requests, photos, audits] = await Promise.all([
        dbPool.query("SELECT id FROM maintenance_requests"),
        dbPool.query("SELECT id FROM maintenance_photos"),
        dbPool.query("SELECT id FROM audit_events"),
      ]);
      expect(requests.rows).toHaveLength(0);
      expect(photos.rows).toHaveLength(0);
      expect(audits.rows).toHaveLength(0);
      expect(storageMocks.deleteMaintenancePhoto).toHaveBeenCalledOnce();
    } finally {
      await dbPool.query("DROP TRIGGER maintenance_photo_failure ON maintenance_photos");
      await dbPool.query("DROP FUNCTION fail_maintenance_photo_insert()");
      consoleSpy.mockRestore();
    }
  });
});

describe("Tenant maintenance request reads (US-MAINT-02)", () => {
  it("lists only own submissions with room, latest status, signed photos, and pagination", async () => {
    await seedSubmittedRequests();

    const response = await request(app)
      .get("/api/v1/maintenance-requests?page=1&pageSize=20")
      .set(auth(tenantToken))
      .expect(200);

    expect(response.body.meta).toEqual({ page: 1, pageSize: 20, total: 2 });
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data.map((item: { id: string }) => item.id)).toEqual([
      OWN_REQUEST_2_ID,
      OWN_REQUEST_ID,
    ]);
    expect(response.body.data[1]).toMatchObject({
      id: OWN_REQUEST_ID,
      title: "Leaking sink",
      room: { id: ROOM_ID, name: "Room 101" },
      status: "InProgress",
      submittedAt: "2026-07-22T02:00:00.000Z",
      photos: [
        {
          id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
          fileUrl:
            "https://storage.test/signed/maintenance-photos%2Ftenant%2Fown-photo.png",
        },
      ],
    });
    expect(JSON.stringify(response.body)).not.toContain("Other tenant secret");
    expect(JSON.stringify(response.body)).not.toContain("secret-photo.png");
    expect(storageMocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalledWith(
      "maintenance-photos/other/secret-photo.png",
    );
  });

  it("opens an owned request and returns the same current status and available photos", async () => {
    await seedSubmittedRequests();

    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}`)
      .set(auth(tenantToken))
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: OWN_REQUEST_ID,
      description: "Water is leaking continuously.",
      room: { id: ROOM_ID, name: "Room 101" },
      status: "InProgress",
      photos: [{ id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd" }],
    });
  });

  it("returns scoped 404 without signing an attachment when another tenant's id is guessed", async () => {
    await seedSubmittedRequests();
    storageMocks.createSignedMaintenancePhotoUrl.mockClear();

    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${OTHER_REQUEST_ID}`)
      .set(auth(tenantToken))
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
    expect(storageMocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalled();
  });
});
