import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { UnprocessableError } from "../../src/lib/errors.js";

const TEST_JWT_SECRET = "api-contract-test-secret";
const LANDLORD_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";
const PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
const SURCHARGE_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => ({
  createUtilityRateService: vi.fn(),
  getCurrentRateService: vi.fn(),
  createSurchargeService: vi.fn(),
  listSurchargesService: vi.fn(),
  updateSurchargeService: vi.fn(),
  deleteSurchargeService: vi.fn(),
}));

vi.mock("../../src/modules/utilities/service.js", () => ({
  createUtilityRateService: mocks.createUtilityRateService,
  getCurrentRateService: mocks.getCurrentRateService,
}));

vi.mock("../../src/modules/charges/service.js", () => ({
  createSurchargeService: mocks.createSurchargeService,
  listSurchargesService: mocks.listSurchargesService,
  updateSurchargeService: mocks.updateSurchargeService,
  deleteSurchargeService: mocks.deleteSurchargeService,
}));

function token(
  sub: string,
  role: "Landlord" | "Tenant",
): string {
  return jwt.sign(
    { sub, role, mustChangePassword: false },
    TEST_JWT_SECRET,
    { expiresIn: "1h" },
  );
}

const utilityView = {
  id: "55555555-5555-4555-8555-555555555555",
  propertyId: PROPERTY_ID,
  electricityRatePerKwh: 3500,
  waterBillingMethod: "Metered" as const,
  waterRatePerM3: 15000,
  waterFlatAmountPerTenant: null,
  effectiveFrom: "2026-07-01",
  createdBy: LANDLORD_ID,
  createdAt: "2026-07-01T00:00:00.000Z",
};

const surchargeView = {
  id: SURCHARGE_ID,
  propertyId: PROPERTY_ID,
  name: "Internet",
  monthlyAmount: 100000,
  effectiveFrom: "2026-07-01",
  effectiveTo: null,
  active: true,
  createdBy: LANDLORD_ID,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("Billing Foundation HTTP contract", () => {
  let app: Express;
  let landlordToken: string;
  let tenantToken: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.DATABASE_URL =
      "postgres://test:test@127.0.0.1:1/contract_tests";
    const module = await import("../../src/app.js");
    app = module.createApp();
    landlordToken = token(LANDLORD_ID, "Landlord");
    tenantToken = token(TENANT_ID, "Tenant");
  });

  beforeEach(() => {
    mocks.createUtilityRateService.mockResolvedValue(utilityView);
    mocks.getCurrentRateService.mockResolvedValue(utilityView);
    mocks.createSurchargeService.mockResolvedValue(surchargeView);
    mocks.listSurchargesService.mockResolvedValue({
      data: [surchargeView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    mocks.updateSurchargeService.mockResolvedValue({
      ...surchargeView,
      monthlyAmount: 120000,
    });
    mocks.deleteSurchargeService.mockResolvedValue({ success: true });
  });

  it("serves the health endpoint", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "rosihome-backend",
    });
  });

  it("returns 401 when a protected endpoint has no bearer token", async () => {
    const response = await request(app)
      .get(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .expect(401);

    expect(response.body).toEqual({
      error: {
        code: "UNAUTHENTICATED",
        message: "Authentication required.",
      },
    });
  });

  it("returns 403 when a Tenant calls a Landlord-only endpoint", async () => {
    const response = await request(app)
      .get(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(403);

    expect(response.body.error).toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("returns 400 for malformed utility input before calling the service", async () => {
    const response = await request(app)
      .post(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        electricityRatePerKwh: -1,
        waterBillingMethod: "Metered",
        waterRatePerM3: 15000,
        effectiveFrom: "2026-07-01",
      })
      .expect(400);

    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(mocks.createUtilityRateService).not.toHaveBeenCalled();
  });

  it("creates a utility-rate version and preserves the success envelope", async () => {
    const body = {
      electricityRatePerKwh: 3500,
      waterBillingMethod: "Metered",
      waterRatePerM3: 15000,
      effectiveFrom: "2026-07-01",
    };

    const response = await request(app)
      .post(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body).toEqual({ data: utilityView });
    expect(mocks.createUtilityRateService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      body,
    );
  });

  it("maps utility business-rule failures to the 422 error envelope", async () => {
    mocks.createUtilityRateService.mockRejectedValue(
      new UnprocessableError(
        "The water billing fields do not match the selected billing method.",
        [
          {
            field: "waterRatePerM3",
            message: "waterRatePerM3 is required when method is Metered.",
          },
        ],
      ),
    );

    const response = await request(app)
      .post(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({
        electricityRatePerKwh: 3500,
        waterBillingMethod: "Metered",
        effectiveFrom: "2026-07-01",
      })
      .expect(422);

    expect(response.body.error).toMatchObject({
      code: "UNPROCESSABLE",
      fields: [{ field: "waterRatePerM3" }],
    });
  });

  it("returns the current utility rate", async () => {
    const response = await request(app)
      .get(`/api/v1/utilities/properties/${PROPERTY_ID}/utility-rates`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: utilityView });
    expect(mocks.getCurrentRateService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
    );
  });

  it("creates a recurring surcharge", async () => {
    const body = {
      name: "Internet",
      monthlyAmount: 100000,
      effectiveFrom: "2026-07-01",
    };

    const response = await request(app)
      .post(`/api/v1/charges/properties/${PROPERTY_ID}/surcharges`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body).toEqual({ data: surchargeView });
    expect(mocks.createSurchargeService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      body,
    );
  });

  it("lists surcharges with default pagination metadata", async () => {
    const response = await request(app)
      .get(`/api/v1/charges/properties/${PROPERTY_ID}/surcharges`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({
      data: [surchargeView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    expect(mocks.listSurchargesService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      { page: 1, pageSize: 20 },
    );
  });

  it("rejects an empty surcharge PATCH body", async () => {
    const response = await request(app)
      .patch(`/api/v1/charges/${SURCHARGE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({})
      .expect(400);

    expect(response.body.error).toMatchObject({
      code: "VALIDATION_ERROR",
    });
    expect(mocks.updateSurchargeService).not.toHaveBeenCalled();
  });

  it("updates a surcharge through the standard success envelope", async () => {
    const response = await request(app)
      .patch(`/api/v1/charges/${SURCHARGE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ monthlyAmount: 120000 })
      .expect(200);

    expect(response.body.data).toMatchObject({ monthlyAmount: 120000 });
    expect(mocks.updateSurchargeService).toHaveBeenCalledWith(
      LANDLORD_ID,
      SURCHARGE_ID,
      { monthlyAmount: 120000 },
    );
  });

  it("soft-deletes a surcharge through the API action", async () => {
    const response = await request(app)
      .delete(`/api/v1/charges/${SURCHARGE_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(response.body).toEqual({ data: { success: true } });
    expect(mocks.deleteSurchargeService).toHaveBeenCalledWith(
      LANDLORD_ID,
      SURCHARGE_ID,
    );
  });
});
