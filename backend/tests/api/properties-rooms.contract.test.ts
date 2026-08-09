import type { Express } from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_JWT_SECRET = "property-room-contract-test-secret";
const LANDLORD_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const PROPERTY_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = "44444444-4444-4444-8444-444444444444";

const propertyMocks = vi.hoisted(() => ({
  createPropertyService: vi.fn(),
  listPropertiesService: vi.fn(),
  getPropertyService: vi.fn(),
  updatePropertyService: vi.fn(),
}));

const roomMocks = vi.hoisted(() => ({
  createRoomService: vi.fn(),
  listRoomsService: vi.fn(),
  getRoomService: vi.fn(),
  updateRoomService: vi.fn(),
  bulkCreateRoomsService: vi.fn(),
}));

vi.mock("../../src/modules/properties/service.js", () => propertyMocks);
vi.mock("../../src/modules/rooms/service.js", () => roomMocks);

function token(sub: string, role: "Landlord" | "Tenant"): string {
  return jwt.sign({ sub, role, mustChangePassword: false }, TEST_JWT_SECRET, {
    expiresIn: "1h",
  });
}

const propertyView = {
  id: PROPERTY_ID,
  landlordId: LANDLORD_ID,
  name: "Sunrise House",
  address: "1 Nguyen Van Cu",
  locality: "Ho Chi Minh City",
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

const roomView = {
  id: ROOM_ID,
  propertyId: PROPERTY_ID,
  name: "Room 101",
  baseRent: 3_000_000,
  status: "Vacant" as const,
  createdAt: "2026-07-01T00:00:00.000Z",
  updatedAt: "2026-07-01T00:00:00.000Z",
};

describe("Property and room HTTP contract", () => {
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
    vi.clearAllMocks();
    propertyMocks.createPropertyService.mockResolvedValue(propertyView);
    propertyMocks.listPropertiesService.mockResolvedValue({
      data: [propertyView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    propertyMocks.getPropertyService.mockResolvedValue(propertyView);
    propertyMocks.updatePropertyService.mockResolvedValue({
      ...propertyView,
      name: "Sunrise Residence",
    });
    roomMocks.createRoomService.mockResolvedValue(roomView);
    roomMocks.listRoomsService.mockResolvedValue({
      data: [roomView],
      meta: { page: 1, pageSize: 20, total: 1 },
    });
    roomMocks.getRoomService.mockResolvedValue(roomView);
    roomMocks.updateRoomService.mockResolvedValue({
      ...roomView,
      name: "Room 102",
      baseRent: 3_200_000,
    });
    roomMocks.bulkCreateRoomsService.mockResolvedValue({
      created: [roomView],
    });
  });

  it("US-PROPERTY-01: creates a property for the authenticated landlord", async () => {
    const body = {
      name: "Sunrise House",
      address: "1 Nguyen Van Cu",
      locality: "Ho Chi Minh City",
    };

    const response = await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body).toEqual({ data: propertyView });
    expect(propertyMocks.createPropertyService).toHaveBeenCalledWith(
      LANDLORD_ID,
      body,
    );
  });

  it("US-PROPERTY-01: rejects invalid input before calling the service", async () => {
    await request(app)
      .post("/api/v1/properties")
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ name: "", address: "" })
      .expect(400);

    expect(propertyMocks.createPropertyService).not.toHaveBeenCalled();
  });

  it("US-PROPERTY-02: lists and updates owned properties", async () => {
    const listResponse = await request(app)
      .get("/api/v1/properties")
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(listResponse.body.data).toEqual([propertyView]);

    const updateResponse = await request(app)
      .patch(`/api/v1/properties/${PROPERTY_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ name: "Sunrise Residence" })
      .expect(200);

    expect(updateResponse.body.data.name).toBe("Sunrise Residence");
    expect(propertyMocks.updatePropertyService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      { name: "Sunrise Residence" },
    );
  });

  it("US-ROOM-01: creates a vacant room for an owned property", async () => {
    const body = { name: "Room 101", baseRent: 3_000_000 };

    const response = await request(app)
      .post(`/api/v1/rooms/properties/${PROPERTY_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body.data.status).toBe("Vacant");
    expect(roomMocks.createRoomService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      body,
    );
  });

  it("US-ROOM-01: rejects a negative base rent", async () => {
    await request(app)
      .post(`/api/v1/rooms/properties/${PROPERTY_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ name: "Room 101", baseRent: -1 })
      .expect(400);

    expect(roomMocks.createRoomService).not.toHaveBeenCalled();
  });

  it("US-ROOM-02: lists and opens rooms with derived status", async () => {
    const listResponse = await request(app)
      .get(`/api/v1/rooms/properties/${PROPERTY_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(listResponse.body.data[0].status).toBe("Vacant");

    const detailResponse = await request(app)
      .get(`/api/v1/rooms/${ROOM_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .expect(200);

    expect(detailResponse.body).toEqual({ data: roomView });
  });

  it("US-ROOM-02: updates editable room fields", async () => {
    const body = { name: "Room 102", baseRent: 3_200_000 };

    const response = await request(app)
      .patch(`/api/v1/rooms/${ROOM_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(200);

    expect(response.body.data).toMatchObject(body);
    expect(roomMocks.updateRoomService).toHaveBeenCalledWith(
      LANDLORD_ID,
      ROOM_ID,
      body,
    );
  });

  it("US-ROOM-02: rejects direct occupancy overrides", async () => {
    await request(app)
      .patch(`/api/v1/rooms/${ROOM_ID}`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send({ status: "Occupied" })
      .expect(400);

    expect(roomMocks.updateRoomService).not.toHaveBeenCalled();
  });

  it("US-ROOM-03: creates multiple rooms through one bulk operation", async () => {
    const body = {
      rooms: [
        { name: "Room 101", baseRent: 3_000_000 },
        { name: "Room 102", baseRent: 3_200_000 },
      ],
    };
    roomMocks.bulkCreateRoomsService.mockResolvedValue({
      created: [
        roomView,
        { ...roomView, id: "55555555-5555-4555-8555-555555555555", name: "Room 102" },
      ],
    });

    const response = await request(app)
      .post(`/api/v1/rooms/properties/${PROPERTY_ID}/bulk`)
      .set("Authorization", `Bearer ${landlordToken}`)
      .send(body)
      .expect(201);

    expect(response.body.data.created).toHaveLength(2);
    expect(roomMocks.bulkCreateRoomsService).toHaveBeenCalledWith(
      LANDLORD_ID,
      PROPERTY_ID,
      body,
    );
  });

  it("rejects Tenant access to landlord property and room operations", async () => {
    await request(app)
      .get("/api/v1/properties")
      .set("Authorization", `Bearer ${tenantToken}`)
      .expect(403);

    await request(app)
      .post(`/api/v1/rooms/properties/${PROPERTY_ID}`)
      .set("Authorization", `Bearer ${tenantToken}`)
      .send({ name: "Room 101", baseRent: 3_000_000 })
      .expect(403);
  });
});
