import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, UnprocessableError } from "../../src/lib/errors.js";

const TEST_JWT_SECRET = "maintenance-api-contract-secret";
const TENANT_USER_ID = "55555555-5555-4555-8555-555555555555";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = "66666666-6666-4666-8666-666666666666";
const REQUEST_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const OTHER_REQUEST_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const mocks = vi.hoisted(() => ({
  submitMaintenanceRequestService: vi.fn(),
  listMaintenanceRequestsService: vi.fn(),
  getMaintenanceRequestService: vi.fn(),
  updateMaintenanceStatusService: vi.fn(),
}));

vi.mock("../../src/modules/maintenance/service.js", () => ({
  submitMaintenanceRequestService: mocks.submitMaintenanceRequestService,
  listMaintenanceRequestsService: mocks.listMaintenanceRequestsService,
  getMaintenanceRequestService: mocks.getMaintenanceRequestService,
  updateMaintenanceStatusService: mocks.updateMaintenanceStatusService,
}));

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

const view = {
  id: REQUEST_ID,
  roomId: ROOM_ID,
  tenantInfoId: "77777777-7777-4777-8777-777777777777",
  title: "Leaking sink",
  description: "Water is leaking continuously below the sink.",
  status: "Pending" as const,
  submittedAt: "2026-07-22T02:00:00.000Z",
  photos: [
    {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      fileUrl: "maintenance-photos/tenant/request/photo.png",
    },
  ],
};

const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const tenantView = {
  id: REQUEST_ID,
  title: "Leaking sink",
  description: "Water is leaking continuously below the sink.",
  room: { id: ROOM_ID, name: "Room 101" },
  status: "InProgress" as const,
  submittedAt: "2026-07-22T02:00:00.000Z",
  photos: [
    {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      fileUrl: "https://storage.test/signed-maintenance-photo",
    },
  ],
};

const tenantList = {
  data: [tenantView],
  meta: { page: 2, pageSize: 5, total: 6 },
};

const landlordView = {
  id: REQUEST_ID,
  title: "Leaking sink",
  description: "Water is leaking continuously below the sink.",
  property: {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Sunrise House",
  },
  room: { id: ROOM_ID, name: "Room 101" },
  tenant: {
    id: "77777777-7777-4777-8777-777777777777",
    fullName: "Tran Thi B",
  },
  status: "InProgress" as const,
  submittedAt: "2026-07-22T02:00:00.000Z",
  photos: [
    {
      id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
      fileUrl: "https://storage.test/signed-maintenance-photo",
    },
  ],
};

const landlordList = {
  data: [landlordView],
  meta: { page: 1, pageSize: 10, total: 1 },
};

const statusUpdateView = {
  id: REQUEST_ID,
  previousStatus: "Pending" as const,
  status: "InProgress" as const,
  completedAt: null,
  updatedAt: "2026-07-22T03:00:00.000Z",
};

describe("Maintenance request HTTP contract", () => {
  let app: Express;
  let tenantToken: string;
  let landlordToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    tenantToken = token(TENANT_USER_ID, "Tenant");
    landlordToken = token(LANDLORD_ID, "Landlord");
  });

  beforeEach(() => {
    mocks.submitMaintenanceRequestService.mockReset().mockResolvedValue(view);
    mocks.listMaintenanceRequestsService.mockReset().mockResolvedValue(tenantList);
    mocks.getMaintenanceRequestService.mockReset().mockResolvedValue(tenantView);
    mocks.updateMaintenanceStatusService
      .mockReset()
      .mockResolvedValue(statusUpdateView);
  });

  it("US-MAINT-02: lists only the authenticated tenant's submissions with pagination", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests?page=2&pageSize=5")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual(tenantList);
    expect(mocks.listMaintenanceRequestsService).toHaveBeenCalledWith(
      { id: TENANT_USER_ID, role: "Tenant" },
      { page: 2, pageSize: 5 },
      {},
    );
  });

  it("US-MAINT-02: opens an owned submission with room, current status, and photos", async () => {
    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${REQUEST_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: tenantView });
    expect(mocks.getMaintenanceRequestService).toHaveBeenCalledWith(
      { id: TENANT_USER_ID, role: "Tenant" },
      REQUEST_ID,
    );
  });

  it("US-MAINT-02/03: requires authentication for listing", async () => {
    await request(app).get("/api/v1/maintenance-requests").expect(401);
    expect(mocks.listMaintenanceRequestsService).not.toHaveBeenCalled();
  });

  it("US-MAINT-02: rejects invalid pagination before calling the service", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests?page=0&pageSize=101")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.listMaintenanceRequestsService).not.toHaveBeenCalled();
  });

  it("US-MAINT-02: returns the same scoped 404 for another tenant's identifier", async () => {
    mocks.getMaintenanceRequestService.mockRejectedValue(
      new NotFoundError("Maintenance request not found."),
    );

    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${OTHER_REQUEST_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("US-MAINT-02: rejects a malformed request identifier", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests/not-a-uuid")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.getMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-03: lists landlord-owned requests with property and status filters", async () => {
    mocks.listMaintenanceRequestsService.mockResolvedValue(landlordList);

    const response = await request(app)
      .get(
        "/api/v1/maintenance-requests?propertyId=22222222-2222-4222-8222-222222222222&status=InProgress&page=1&pageSize=10",
      )
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual(landlordList);
    expect(mocks.listMaintenanceRequestsService).toHaveBeenCalledWith(
      { id: LANDLORD_ID, role: "Landlord" },
      { page: 1, pageSize: 10 },
      {
        propertyId: "22222222-2222-4222-8222-222222222222",
        status: "InProgress",
      },
    );
  });

  it("US-MAINT-03: opens an owned request with triage context and accessible photos", async () => {
    mocks.getMaintenanceRequestService.mockResolvedValue(landlordView);

    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${REQUEST_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: landlordView });
    expect(mocks.getMaintenanceRequestService).toHaveBeenCalledWith(
      { id: LANDLORD_ID, role: "Landlord" },
      REQUEST_ID,
    );
  });

  it("US-MAINT-03: rejects invalid landlord filters before calling the service", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests?propertyId=not-a-uuid&status=Draft")
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.listMaintenanceRequestsService).not.toHaveBeenCalled();
  });

  it("US-MAINT-04: updates status for a landlord through the standard envelope", async () => {
    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "InProgress" })
      .expect(200);

    expect(response.body).toEqual({ data: statusUpdateView });
    expect(mocks.updateMaintenanceStatusService).toHaveBeenCalledWith(
      LANDLORD_ID,
      REQUEST_ID,
      { status: "InProgress" },
    );
  });

  it("US-MAINT-04: requires authentication and the Landlord role", async () => {
    await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .send({ status: "InProgress" })
      .expect(401);

    await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ status: "InProgress" })
      .expect(403);

    expect(mocks.updateMaintenanceStatusService).not.toHaveBeenCalled();
  });

  it("US-MAINT-04: rejects malformed ids, statuses, and extra fields", async () => {
    await request(app)
      .patch("/api/v1/maintenance-requests/not-a-uuid/status")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "InProgress" })
      .expect(400);

    await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "In Progress" })
      .expect(400);

    await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "Completed", completedAt: "2026-07-22" })
      .expect(400);

    expect(mocks.updateMaintenanceStatusService).not.toHaveBeenCalled();
  });

  it("US-MAINT-04: maps duplicate or disallowed transitions to 422", async () => {
    mocks.updateMaintenanceStatusService.mockRejectedValue(
      new UnprocessableError("Maintenance request is already Pending."),
    );

    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "Pending" })
      .expect(422);

    expect(response.body.error).toMatchObject({ code: "UNPROCESSABLE" });
  });

  it("US-MAINT-04: preserves scoped 404 responses for foreign requests", async () => {
    mocks.updateMaintenanceStatusService.mockRejectedValue(
      new NotFoundError("Maintenance request not found."),
    );

    const response = await request(app)
      .patch(`/api/v1/maintenance-requests/${OTHER_REQUEST_ID}/status`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "Completed" })
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("US-MAINT-01: creates a request with a multipart photo and standard envelope", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .attach("photos", png, { filename: "issue.png", contentType: "image/png" })
      .expect(201);

    expect(response.body).toEqual({ data: view });
    expect(mocks.submitMaintenanceRequestService).toHaveBeenCalledWith(
      TENANT_USER_ID,
      {
        roomId: ROOM_ID,
        title: "Leaking sink",
        description: "Water is leaking continuously below the sink.",
      },
      [
        expect.objectContaining({
          originalName: "issue.png",
          declaredContentType: "image/png",
          buffer: png,
        }),
      ],
    );
  });

  it("US-MAINT-01: accepts the photos[] multipart field alias", async () => {
    await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .attach("photos[]", png, { filename: "issue.png", contentType: "image/png" })
      .expect(201);
  });

  it("US-MAINT-01: rejects missing title before calling the service", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("description", "Water is leaking continuously below the sink.")
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.submitMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: rejects a fourth photo", async () => {
    const call = request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.");

    for (let index = 0; index < 4; index += 1) {
      call.attach("photos", png, {
        filename: `issue-${index}.png`,
        contentType: "image/png",
      });
    }

    const response = await call.expect(400);
    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.submitMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: rejects a file under an unexpected multipart field", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .attach("avatar", png, { filename: "issue.png", contentType: "image/png" })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.submitMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: rejects too many multipart text fields", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .field("unexpected", "value")
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.submitMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: rejects a photo larger than 5 MB", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .attach("photos", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "too-large.png",
        contentType: "image/png",
      })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.submitMaintenanceRequestService).not.toHaveBeenCalled();
  });

  it("US-MAINT-01: requires authentication", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .expect(401);

    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
  });

  it("US-MAINT-01: rejects a Landlord role", async () => {
    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${landlordToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
  });

  it("US-MAINT-01: maps a non-applicable lease to a scoped 404", async () => {
    mocks.submitMaintenanceRequestService.mockRejectedValue(
      new NotFoundError("Active lease not found for this room."),
    );

    const response = await request(app)
      .post("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${tenantToken}`)
      .field("roomId", ROOM_ID)
      .field("title", "Leaking sink")
      .field("description", "Water is leaking continuously below the sink.")
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
  });
});
