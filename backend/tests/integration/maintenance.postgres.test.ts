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
const landlordToken = sign("Landlord", LANDLORD_ID);
const otherLandlordToken = sign("Landlord", OTHER_LANDLORD_ID);

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

describe("Landlord maintenance request reviews (US-MAINT-03)", () => {
  it("lists only the authenticated landlord's portfolio and filters by property/status", async () => {
    await seedSubmittedRequests();

    const allOwned = await request(app)
      .get("/api/v1/maintenance-requests?page=1&pageSize=20")
      .set(auth(landlordToken))
      .expect(200);

    expect(allOwned.body.meta).toEqual({ page: 1, pageSize: 20, total: 2 });
    expect(allOwned.body.data.map((item: { id: string }) => item.id)).toEqual([
      OWN_REQUEST_2_ID,
      OWN_REQUEST_ID,
    ]);
    expect(JSON.stringify(allOwned.body)).not.toContain("Other tenant secret");
    expect(JSON.stringify(allOwned.body)).not.toContain("secret-photo.png");

    const pendingOwned = await request(app)
      .get(
        `/api/v1/maintenance-requests?propertyId=${PROPERTY_ID}&status=Pending&page=1&pageSize=20`,
      )
      .set(auth(landlordToken))
      .expect(200);

    expect(pendingOwned.body.meta).toEqual({ page: 1, pageSize: 20, total: 1 });
    expect(pendingOwned.body.data).toHaveLength(1);
    expect(pendingOwned.body.data[0]).toMatchObject({
      id: OWN_REQUEST_2_ID,
      status: "Pending",
      property: { id: PROPERTY_ID, name: "Sunrise House" },
      room: { id: ROOM_ID, name: "Room 101" },
      tenant: { id: TENANT_INFO_ID, fullName: "Tran Thi B" },
    });

    const foreignProperty = await request(app)
      .get(`/api/v1/maintenance-requests?propertyId=${OTHER_PROPERTY_ID}`)
      .set(auth(landlordToken))
      .expect(200);
    expect(foreignProperty.body.meta.total).toBe(0);
    expect(foreignProperty.body.data).toEqual([]);
    expect(storageMocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalledWith(
      "maintenance-photos/other/secret-photo.png",
    );
  });

  it("opens an owned request with description, property/room/tenant context, time, and signed photos", async () => {
    await seedSubmittedRequests();

    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}`)
      .set(auth(landlordToken))
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: OWN_REQUEST_ID,
      title: "Leaking sink",
      description: "Water is leaking continuously.",
      property: { id: PROPERTY_ID, name: "Sunrise House" },
      room: { id: ROOM_ID, name: "Room 101" },
      tenant: { id: TENANT_INFO_ID, fullName: "Tran Thi B" },
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
  });

  it("returns a scoped 404 and never signs photos for another landlord's request", async () => {
    await seedSubmittedRequests();
    storageMocks.createSignedMaintenancePhotoUrl.mockClear();

    await request(app)
      .get(`/api/v1/maintenance-requests/${OTHER_REQUEST_ID}`)
      .set(auth(landlordToken))
      .expect(404);

    await request(app)
      .get(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}`)
      .set(auth(otherLandlordToken))
      .expect(404);

    expect(storageMocks.createSignedMaintenancePhotoUrl).not.toHaveBeenCalled();
  });

  it("does not change status, timestamps, history, or audit data when a request is reviewed", async () => {
    await seedSubmittedRequests();
    const before = await dbPool.query(
      `SELECT status, completed_at, updated_at
       FROM maintenance_requests WHERE id = $1`,
      [OWN_REQUEST_ID],
    );

    await request(app)
      .get("/api/v1/maintenance-requests")
      .set(auth(landlordToken))
      .expect(200);
    await request(app)
      .get(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}`)
      .set(auth(landlordToken))
      .expect(200);

    const after = await dbPool.query(
      `SELECT status, completed_at, updated_at
       FROM maintenance_requests WHERE id = $1`,
      [OWN_REQUEST_ID],
    );
    const history = await dbPool.query(
      "SELECT id FROM maintenance_status_history WHERE request_id = $1",
      [OWN_REQUEST_ID],
    );
    const audits = await dbPool.query(
      "SELECT id FROM audit_events WHERE entity_id = $1",
      [OWN_REQUEST_ID],
    );

    expect(after.rows).toEqual(before.rows);
    expect(after.rows[0]).toMatchObject({
      status: "InProgress",
      completed_at: null,
    });
    expect(history.rows).toEqual([]);
    expect(audits.rows).toEqual([]);
  });
});

describe("Maintenance status updates (US-MAINT-04)", () => {
  it("persists each forward transition, responsible landlord, completion time, audit, push notification, and tenant-visible status", async () => {
    await seedSubmittedRequests();

    const inProgress = await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "InProgress" })
      .expect(200);

    expect(inProgress.body.data).toMatchObject({
      id: OWN_REQUEST_2_ID,
      previousStatus: "Pending",
      status: "InProgress",
      completedAt: null,
    });

    const completed = await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "Completed" })
      .expect(200);

    expect(completed.body.data).toMatchObject({
      id: OWN_REQUEST_2_ID,
      previousStatus: "InProgress",
      status: "Completed",
    });
    expect(completed.body.data.completedAt).not.toBeNull();

    const persisted = await dbPool.query(
      `SELECT status, completed_at, updated_at
       FROM maintenance_requests WHERE id = $1`,
      [OWN_REQUEST_2_ID],
    );
    expect(persisted.rows[0]).toMatchObject({ status: "Completed" });
    expect(persisted.rows[0]!.completed_at).not.toBeNull();

    const history = await dbPool.query(
      `SELECT from_status, to_status, changed_by, changed_at
       FROM maintenance_status_history
       WHERE request_id = $1 ORDER BY changed_at, id`,
      [OWN_REQUEST_2_ID],
    );
    expect(history.rows).toHaveLength(2);
    expect(history.rows.map(({ from_status, to_status, changed_by }) => ({
      from_status,
      to_status,
      changed_by,
    }))).toEqual([
      {
        from_status: "Pending",
        to_status: "InProgress",
        changed_by: LANDLORD_ID,
      },
      {
        from_status: "InProgress",
        to_status: "Completed",
        changed_by: LANDLORD_ID,
      },
    ]);
    expect(history.rows.every((row) => row.changed_at != null)).toBe(true);

    const audits = await dbPool.query(
      `SELECT actor_user_id, action, before_value, after_value
       FROM audit_events WHERE entity_id = $1 ORDER BY created_at, id`,
      [OWN_REQUEST_2_ID],
    );
    expect(audits.rows).toHaveLength(2);
    expect(audits.rows[0]).toMatchObject({
      actor_user_id: LANDLORD_ID,
      action: "maintenance_request.status_changed",
      before_value: { status: "Pending", completedAt: null },
      after_value: { status: "InProgress", completedAt: null },
    });

    const notifications = await dbPool.query(
      `SELECT user_id, type, channel, link_ref, dedupe_key
       FROM notifications ORDER BY created_at, id`,
    );
    expect(notifications.rows).toEqual([
      {
        user_id: TENANT_USER_ID,
        type: "maintenance.status_changed",
        channel: "Push",
        link_ref: `maintenance:${OWN_REQUEST_2_ID}`,
        dedupe_key: `maintenance.status_changed:${OWN_REQUEST_2_ID}:InProgress`,
      },
      {
        user_id: TENANT_USER_ID,
        type: "maintenance.status_changed",
        channel: "Push",
        link_ref: `maintenance:${OWN_REQUEST_2_ID}`,
        dedupe_key: `maintenance.status_changed:${OWN_REQUEST_2_ID}:Completed`,
      },
    ]);

    const tenantView = await request(app)
      .get(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}`)
      .set(auth(tenantToken))
      .expect(200);
    expect(tenantView.body.data.status).toBe("Completed");
  });

  it("allows Pending to transition directly to Completed", async () => {
    await seedSubmittedRequests();

    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "Completed" })
      .expect(200);

    expect(response.body.data).toMatchObject({
      previousStatus: "Pending",
      status: "Completed",
    });
    expect(response.body.data.completedAt).not.toBeNull();
  });

  it("rolls back the status and audit when status-history persistence fails", async () => {
    await seedSubmittedRequests();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await dbPool.query(`
      CREATE FUNCTION fail_maintenance_history_insert() RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'forced maintenance history failure';
      END;
      $$ LANGUAGE plpgsql;
      CREATE TRIGGER maintenance_history_failure
      BEFORE INSERT ON maintenance_status_history
      FOR EACH ROW EXECUTE FUNCTION fail_maintenance_history_insert();
    `);

    try {
      await request(app)
        .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
        .set(auth(landlordToken))
        .send({ status: "InProgress" })
        .expect(500);

      const [requestRows, history, audits, notifications] = await Promise.all([
        dbPool.query(
          "SELECT status, completed_at FROM maintenance_requests WHERE id = $1",
          [OWN_REQUEST_2_ID],
        ),
        dbPool.query(
          "SELECT id FROM maintenance_status_history WHERE request_id = $1",
          [OWN_REQUEST_2_ID],
        ),
        dbPool.query("SELECT id FROM audit_events WHERE entity_id = $1", [
          OWN_REQUEST_2_ID,
        ]),
        dbPool.query("SELECT id FROM notifications"),
      ]);
      expect(requestRows.rows[0]).toMatchObject({
        status: "Pending",
        completed_at: null,
      });
      expect(history.rows).toEqual([]);
      expect(audits.rows).toEqual([]);
      expect(notifications.rows).toEqual([]);
    } finally {
      await dbPool.query(
        "DROP TRIGGER maintenance_history_failure ON maintenance_status_history",
      );
      await dbPool.query("DROP FUNCTION fail_maintenance_history_insert()");
      consoleSpy.mockRestore();
    }
  });

  it("rejects same-status and backward transitions without side effects", async () => {
    await seedSubmittedRequests();

    await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "InProgress" })
      .expect(422);
    await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "Pending" })
      .expect(422);

    const [requestRows, history, audits, notifications] = await Promise.all([
      dbPool.query(
        "SELECT status, completed_at FROM maintenance_requests WHERE id = $1",
        [OWN_REQUEST_ID],
      ),
      dbPool.query(
        "SELECT id FROM maintenance_status_history WHERE request_id = $1",
        [OWN_REQUEST_ID],
      ),
      dbPool.query("SELECT id FROM audit_events WHERE entity_id = $1", [
        OWN_REQUEST_ID,
      ]),
      dbPool.query("SELECT id FROM notifications"),
    ]);
    expect(requestRows.rows[0]).toMatchObject({
      status: "InProgress",
      completed_at: null,
    });
    expect(history.rows).toEqual([]);
    expect(audits.rows).toEqual([]);
    expect(notifications.rows).toEqual([]);
  });

  it("returns scoped 404 for a foreign landlord and forbids tenants", async () => {
    await seedSubmittedRequests();

    await request(app)
      .patch(`/api/v1/maintenance-requests/${OTHER_REQUEST_ID}/status`)
      .set(auth(landlordToken))
      .send({ status: "Completed" })
      .expect(404);
    await request(app)
      .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
      .set(auth(tenantToken))
      .send({ status: "Completed" })
      .expect(403);

    const rows = await dbPool.query(
      "SELECT id FROM maintenance_status_history",
    );
    expect(rows.rows).toEqual([]);
  });

  it("allows only one of two concurrent duplicate transitions to commit", async () => {
    await seedSubmittedRequests();

    const calls = [1, 2].map(() =>
      request(app)
        .patch(`/api/v1/maintenance-requests/${OWN_REQUEST_2_ID}/status`)
        .set(auth(landlordToken))
        .send({ status: "InProgress" }),
    );
    const responses = await Promise.all(calls);

    expect(responses.map((response) => response.status).sort()).toEqual([
      200,
      422,
    ]);
    const [history, audits, notifications] = await Promise.all([
      dbPool.query(
        "SELECT id FROM maintenance_status_history WHERE request_id = $1",
        [OWN_REQUEST_2_ID],
      ),
      dbPool.query("SELECT id FROM audit_events WHERE entity_id = $1", [
        OWN_REQUEST_2_ID,
      ]),
      dbPool.query(
        "SELECT id FROM notifications WHERE dedupe_key = $1",
        [`maintenance.status_changed:${OWN_REQUEST_2_ID}:InProgress`],
      ),
    ]);
    expect(history.rows).toHaveLength(1);
    expect(audits.rows).toHaveLength(1);
    expect(notifications.rows).toHaveLength(1);
  });
});
