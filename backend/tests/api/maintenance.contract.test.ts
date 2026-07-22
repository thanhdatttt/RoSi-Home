import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../../src/lib/errors.js";

const TEST_JWT_SECRET = "maintenance-api-contract-secret";
const TENANT_USER_ID = "55555555-5555-4555-8555-555555555555";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = "66666666-6666-4666-8666-666666666666";
const REQUEST_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const OTHER_REQUEST_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

const mocks = vi.hoisted(() => ({
  submitMaintenanceRequestService: vi.fn(),
  listTenantMaintenanceRequestsService: vi.fn(),
  getTenantMaintenanceRequestService: vi.fn(),
}));

vi.mock("../../src/modules/maintenance/service.js", () => ({
  submitMaintenanceRequestService: mocks.submitMaintenanceRequestService,
  listTenantMaintenanceRequestsService: mocks.listTenantMaintenanceRequestsService,
  getTenantMaintenanceRequestService: mocks.getTenantMaintenanceRequestService,
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
    mocks.listTenantMaintenanceRequestsService.mockReset().mockResolvedValue(tenantList);
    mocks.getTenantMaintenanceRequestService.mockReset().mockResolvedValue(tenantView);
  });

  it("US-MAINT-02: lists only the authenticated tenant's submissions with pagination", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests?page=2&pageSize=5")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual(tenantList);
    expect(mocks.listTenantMaintenanceRequestsService).toHaveBeenCalledWith(
      TENANT_USER_ID,
      { page: 2, pageSize: 5 },
    );
  });

  it("US-MAINT-02: opens an owned submission with room, current status, and photos", async () => {
    const response = await request(app)
      .get(`/api/v1/maintenance-requests/${REQUEST_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: tenantView });
    expect(mocks.getTenantMaintenanceRequestService).toHaveBeenCalledWith(
      TENANT_USER_ID,
      REQUEST_ID,
    );
  });

  it("US-MAINT-02: requires Tenant authentication for listing", async () => {
    await request(app).get("/api/v1/maintenance-requests").expect(401);

    const response = await request(app)
      .get("/api/v1/maintenance-requests")
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.listTenantMaintenanceRequestsService).not.toHaveBeenCalled();
  });

  it("US-MAINT-02: rejects invalid pagination before calling the service", async () => {
    const response = await request(app)
      .get("/api/v1/maintenance-requests?page=0&pageSize=101")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.listTenantMaintenanceRequestsService).not.toHaveBeenCalled();
  });

  it("US-MAINT-02: returns the same scoped 404 for another tenant's identifier", async () => {
    mocks.getTenantMaintenanceRequestService.mockRejectedValue(
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
    expect(mocks.getTenantMaintenanceRequestService).not.toHaveBeenCalled();
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
