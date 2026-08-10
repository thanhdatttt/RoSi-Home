import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictError, NotFoundError, UnprocessableError } from "../../src/lib/errors.js";

const TEST_JWT_SECRET = "api-contract-test-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";
const PROPERTY_ID = "55555555-5555-4555-8555-555555555555";
const ROOM_ID = "22222222-2222-4222-8222-222222222222";
const LEASE_ID = "66666666-6666-4666-8666-666666666666";

const mocks = vi.hoisted(() => ({
  createLeaseService: vi.fn(),
  listLeasesService: vi.fn(),
  getLeaseService: vi.fn(),
  updateOrRenewLeaseService: vi.fn(),
  endLeaseService: vi.fn(),
  listUpcomingExpirationsService: vi.fn(),
  getLeaseReminderConfigService: vi.fn(),
  updateLeaseReminderConfigService: vi.fn(),
  registerDeviceTokenService: vi.fn(),
  unregisterDeviceTokenService: vi.fn(),
  sendTestNotificationService: vi.fn(),
}));

vi.mock("../../src/modules/leases/service.js", () => ({
  createLeaseService: mocks.createLeaseService,
  listLeasesService: mocks.listLeasesService,
  getLeaseService: mocks.getLeaseService,
  updateOrRenewLeaseService: mocks.updateOrRenewLeaseService,
  endLeaseService: mocks.endLeaseService,
  listUpcomingExpirationsService: mocks.listUpcomingExpirationsService,
  getLeaseReminderConfigService: mocks.getLeaseReminderConfigService,
  updateLeaseReminderConfigService: mocks.updateLeaseReminderConfigService,
}));

vi.mock("../../src/modules/notifications/service.js", () => ({
  registerDeviceTokenService: mocks.registerDeviceTokenService,
  unregisterDeviceTokenService: mocks.unregisterDeviceTokenService,
  sendTestNotificationService: mocks.sendTestNotificationService,
}));

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

const leaseView = {
  id: LEASE_ID,
  roomId: ROOM_ID,
  roomName: "Room A",
  propertyId: PROPERTY_ID,
  propertyName: "Property A",
  tenantInfoId: TENANT_ID,
  tenantId: TENANT_ID,
  tenant: { fullName: "Tran Thi B", phone: "0905556677", email: "t@example.com" },
  startDate: "2026-07-01",
  endDate: "2026-12-31",
  actualEndDate: null,
  agreedRent: 3500000,
  deposit: 3500000,
  status: "Active" as const,
  createdBy: LANDLORD_ID,
  endedBy: null,
  endedAt: null,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const reminderConfigView = {
  propertyId: PROPERTY_ID,
  remindAt30Days: true,
  remindAt15Days: true,
  remindAt7Days: true,
};

const deviceTokenRow = {
  id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
  platform: "ios" as const,
};

describe("Leases + Notifications HTTP contract", () => {
  let app: Express;
  let landlordToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL = "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    landlordToken = token(LANDLORD_ID, "Landlord");
    tenantToken = token(TENANT_ID, "Tenant");
  });

  beforeEach(() => {
    mocks.createLeaseService.mockResolvedValue({
      lease: leaseView,
      tenantAccountProvisioned: true,
    });
    mocks.listLeasesService.mockResolvedValue({
      data: [leaseView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    mocks.getLeaseService.mockResolvedValue(leaseView);
    mocks.updateOrRenewLeaseService.mockResolvedValue(leaseView);
    mocks.endLeaseService.mockResolvedValue({ ...leaseView, status: "Ended" });
    mocks.listUpcomingExpirationsService.mockResolvedValue([]);
    mocks.getLeaseReminderConfigService.mockResolvedValue(reminderConfigView);
    mocks.updateLeaseReminderConfigService.mockResolvedValue(reminderConfigView);
    mocks.registerDeviceTokenService.mockResolvedValue(deviceTokenRow);
    mocks.unregisterDeviceTokenService.mockResolvedValue(undefined);
    mocks.sendTestNotificationService.mockResolvedValue({ sent: true, deduped: false });
  });

  // --- Leases -------------------------------------------------------------

  it("US-LEASE-01: rejects an unauthenticated lease create", async () => {
    const response = await request(app)
      .post("/api/v1/leases")
      .send({ roomId: ROOM_ID })
      .expect(401);

    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
    expect(mocks.createLeaseService).not.toHaveBeenCalled();
  });

  it("US-LEASE-01: rejects a Tenant creating a lease", async () => {
    const response = await request(app)
      .post("/api/v1/leases")
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ roomId: ROOM_ID })
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
    expect(mocks.createLeaseService).not.toHaveBeenCalled();
  });

  it("US-LEASE-01: rejects malformed create input before calling the service", async () => {
    const response = await request(app)
      .post("/api/v1/leases")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        roomId: ROOM_ID,
        tenant: { fullName: "Bad", phone: "x", idNumber: "y", email: "not-an-email" },
        startDate: "2026-12-31",
        endDate: "2026-07-01",
        agreedRent: -5,
        deposit: 1000000,
      })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.createLeaseService).not.toHaveBeenCalled();
  });

  it("US-LEASE-01: creates a lease and returns the standard envelope", async () => {
    const body = {
      roomId: ROOM_ID,
      tenant: {
        fullName: "Tran Thi B",
        phone: "0905556677",
        idNumber: "07912304567",
        email: "t@example.com",
      },
      startDate: "2026-07-01",
      endDate: "2026-12-31",
      agreedRent: 3500000,
      deposit: 3500000,
    };

    const response = await request(app)
      .post("/api/v1/leases")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body).toEqual({
      data: leaseView,
      meta: { tenantAccountProvisioned: true },
    });
    expect(mocks.createLeaseService).toHaveBeenCalledWith(LANDLORD_ID, body);
  });

  it("US-LEASE-01: maps an overlapping lease to the 409 error envelope", async () => {
    mocks.createLeaseService.mockRejectedValue(
      new ConflictError("This room already has an active lease covering that period."),
    );

    const response = await request(app)
      .post("/api/v1/leases")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        roomId: ROOM_ID,
        tenant: {
          fullName: "Overlap Tenant",
          phone: "0907778889",
          idNumber: "0799999999",
          email: "overlap@example.com",
        },
        startDate: "2026-08-01",
        endDate: "2026-09-30",
        agreedRent: 3000000,
        deposit: 3000000,
      })
      .expect(409);

    expect(response.body.error).toMatchObject({ code: "CONFLICT" });
  });

  it("US-LEASE-01: maps end-before-start to the 422 error envelope", async () => {
    mocks.createLeaseService.mockRejectedValue(
      new UnprocessableError("endDate must be after startDate."),
    );

    const response = await request(app)
      .post("/api/v1/leases")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        roomId: ROOM_ID,
        tenant: {
          fullName: "Bad Lease",
          phone: "0900000000",
          idNumber: "0000000000",
          email: "bad@example.com",
        },
        startDate: "2026-12-31",
        endDate: "2026-07-01",
        agreedRent: 1000000,
        deposit: 1000000,
      })
      .expect(422);

    expect(response.body.error).toMatchObject({ code: "UNPROCESSABLE" });
  });

  it("US-LEASE-02: a Tenant can view their own lease", async () => {
    const response = await request(app)
      .get(`/api/v1/leases/${LEASE_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: leaseView });
    expect(mocks.getLeaseService).toHaveBeenCalledWith(
      expect.objectContaining({ id: TENANT_ID, role: "Tenant" }),
      LEASE_ID,
    );
  });

  it("US-LEASE-02: returns 404 when the lease does not exist for the caller", async () => {
    mocks.getLeaseService.mockRejectedValue(new NotFoundError("Lease not found."));

    const response = await request(app)
      .get(`/api/v1/leases/${LEASE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(404);

    expect(response.body.error).toMatchObject({ code: "NOT_FOUND" });
  });

  it("US-LEASE-02: lists leases with pagination metadata", async () => {
    const response = await request(app)
      .get("/api/v1/leases")
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({
      data: [leaseView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
  });

  it("US-LEASE-03: updates a lease through the standard envelope", async () => {
    const response = await request(app)
      .patch(`/api/v1/leases/${LEASE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ agreedRent: 3600000 })
      .expect(200);

    expect(response.body).toEqual({ data: leaseView });
    expect(mocks.updateOrRenewLeaseService).toHaveBeenCalledWith(
      LANDLORD_ID,
      LEASE_ID,
      { agreedRent: 3600000 },
    );
  });

  it("US-LEASE-03: rejects an empty PATCH body", async () => {
    const response = await request(app)
      .patch(`/api/v1/leases/${LEASE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.updateOrRenewLeaseService).not.toHaveBeenCalled();
  });

  it("US-LEASE-04: ends a lease and returns the Ended view", async () => {
    const response = await request(app)
      .post(`/api/v1/leases/${LEASE_ID}/end`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ actualEndDate: "2026-08-31" })
      .expect(200);

    expect(response.body.data).toMatchObject({ status: "Ended" });
    expect(mocks.endLeaseService).toHaveBeenCalledWith(
      LANDLORD_ID,
      LEASE_ID,
      "2026-08-31",
    );
  });

  it("US-LEASE-04: rejects a malformed actualEndDate before calling the service", async () => {
    const response = await request(app)
      .post(`/api/v1/leases/${LEASE_ID}/end`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ actualEndDate: "not-a-date" })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.endLeaseService).not.toHaveBeenCalled();
  });

  it("US-LEASE-06: lists upcoming expirations for a Landlord", async () => {
    const response = await request(app)
      .get("/api/v1/leases/upcoming-expirations")
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: [] });
    expect(mocks.listUpcomingExpirationsService).toHaveBeenCalledWith(LANDLORD_ID);
  });

  it("US-LEASE-06: rejects a Tenant viewing upcoming expirations", async () => {
    const response = await request(app)
      .get("/api/v1/leases/upcoming-expirations")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(403);

    expect(response.body.error).toMatchObject({ code: "FORBIDDEN" });
  });

  it("US-LEASE-05: gets the lease reminder config for a property", async () => {
    const response = await request(app)
      .get(`/api/v1/properties/${PROPERTY_ID}/lease-reminder-config`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: reminderConfigView });
    expect(mocks.getLeaseReminderConfigService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
    );
  });

  it("US-LEASE-05: updates the lease reminder config", async () => {
    const response = await request(app)
      .patch(`/api/v1/properties/${PROPERTY_ID}/lease-reminder-config`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ remindAt7Days: true })
      .expect(200);

    expect(response.body).toEqual({ data: reminderConfigView });
    expect(mocks.updateLeaseReminderConfigService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      { remindAt7Days: true },
    );
  });

  it("US-LEASE-05: rejects an empty reminder config PATCH", async () => {
    const response = await request(app)
      .patch(`/api/v1/properties/${PROPERTY_ID}/lease-reminder-config`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.updateLeaseReminderConfigService).not.toHaveBeenCalled();
  });

  // --- Notifications -------------------------------------------------------

  it("registers a device token through the standard envelope", async () => {
    const response = await request(app)
      .post("/api/v1/notifications/device-tokens")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ pushToken: "ExponentPushToken[abc123]", platform: "ios" })
      .expect(201);

    expect(response.body).toEqual({ data: { id: deviceTokenRow.id, platform: "ios" } });
    expect(mocks.registerDeviceTokenService).toHaveBeenCalledWith(
      LANDLORD_ID,
      "ExponentPushToken[abc123]",
      "ios",
    );
  });

  it("rejects a device-token registration with an invalid platform", async () => {
    const response = await request(app)
      .post("/api/v1/notifications/device-tokens")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ pushToken: "ExponentPushToken[abc123]", platform: "windows" })
      .expect(400);

    expect(response.body.error).toMatchObject({ code: "VALIDATION_ERROR" });
    expect(mocks.registerDeviceTokenService).not.toHaveBeenCalled();
  });

  it("unregisters a device token", async () => {
    const response = await request(app)
      .delete("/api/v1/notifications/device-tokens")
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ pushToken: "ExponentPushToken[abc123]" })
      .expect(200);

    expect(response.body).toEqual({ data: { success: true } });
    expect(mocks.unregisterDeviceTokenService).toHaveBeenCalledWith(
      TENANT_ID,
      "ExponentPushToken[abc123]",
    );
  });

  it("sends a test notification for the calling user", async () => {
    const response = await request(app)
      .post("/api/v1/notifications/test")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: { sent: true, deduped: false } });
    expect(mocks.sendTestNotificationService).toHaveBeenCalledWith(TENANT_ID);
  });

  it("rejects an unauthenticated device-token registration", async () => {
    const response = await request(app)
      .post("/api/v1/notifications/device-tokens")
      .send({ pushToken: "ExponentPushToken[abc123]", platform: "ios" })
      .expect(401);

    expect(response.body.error).toMatchObject({ code: "UNAUTHENTICATED" });
  });
});
