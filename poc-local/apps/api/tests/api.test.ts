import type { Express } from "express";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import {
  createDatabase,
  type DatabaseConnection,
} from "../src/db/client.js";
import {
  DEMO_PASSWORD,
  initializeDatabase,
  resetDatabase,
} from "../src/db/initialize.js";

const JWT_SECRET = "test-secret-at-least-sixteen-characters";

let app: Express;
let database: DatabaseConnection;

async function login(email = "landlord-a@poc.local"): Promise<string> {
  const response = await request(app).post("/api/auth/login").send({
    email,
    password: DEMO_PASSWORD,
  });
  expect(response.status).toBe(200);
  return response.body.token as string;
}

async function createProperty(token: string, name = "Sunrise House") {
  return request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, address: "12 Local Demo Street" });
}

beforeAll(async () => {
  database = await createDatabase();
  await initializeDatabase(database);
  app = createApp({ database, jwtSecret: JWT_SECRET });
});

beforeEach(async () => {
  await resetDatabase(database);
});

afterAll(async () => {
  await database.client.close();
});

describe("local API", () => {
  it("reports the local storage health", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok", storage: "pglite" });
  });

  it("logs a seeded landlord in without returning password fields", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: "LANDLORD-A@POC.LOCAL",
      password: DEMO_PASSWORD,
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user).toEqual({
      id: "landlord-a",
      email: "landlord-a@poc.local",
      displayName: "Landlord A",
      role: "Landlord",
    });
    expect(JSON.stringify(response.body)).not.toContain("passwordHash");
    expect(JSON.stringify(response.body)).not.toContain("passwordSalt");
  });

  it("returns the same unauthorized response for unknown email and bad password", async () => {
    const unknown = await request(app).post("/api/auth/login").send({
      email: "unknown@poc.local",
      password: DEMO_PASSWORD,
    });
    const wrongPassword = await request(app).post("/api/auth/login").send({
      email: "landlord-a@poc.local",
      password: "wrong-password",
    });

    expect(unknown.status).toBe(401);
    expect(wrongPassword.status).toBe(401);
    expect(unknown.body).toEqual(wrongPassword.body);
  });

  it("rejects protected access without a token", async () => {
    const response = await request(app).get("/api/properties");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("creates, lists, reads, and updates utility rates for an owned property", async () => {
    const token = await login();
    const created = await createProperty(token);

    expect(created.status).toBe(201);
    expect(created.body.property.utilityRates).toBeNull();
    const propertyId = created.body.property.id as string;

    const listed = await request(app)
      .get("/api/properties")
      .set("Authorization", `Bearer ${token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.properties).toHaveLength(1);
    expect(listed.body.properties[0].id).toBe(propertyId);

    const updated = await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: 3_500, waterRate: 18_000 });
    expect(updated.status).toBe(200);
    expect(updated.body.property.utilityRates).toMatchObject({
      electricityRate: 3_500,
      waterRate: 18_000,
    });

    const detail = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.status).toBe(200);
    expect(detail.body.property.utilityRates.electricityRate).toBe(3_500);
  });

  it("rejects invalid property and utility-rate inputs without persisting them", async () => {
    const token = await login();
    const invalidProperty = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", address: "x" });
    expect(invalidProperty.status).toBe(422);
    expect(invalidProperty.body.error.code).toBe("VALIDATION_ERROR");

    const created = await createProperty(token);
    const propertyId = created.body.property.id as string;
    const invalidRate = await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: -1, waterRate: 2.5 });
    expect(invalidRate.status).toBe(422);

    const detail = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(detail.body.property.utilityRates).toBeNull();
  });

  it("hides another landlord's property on reads and updates", async () => {
    const ownerToken = await login("landlord-a@poc.local");
    const otherToken = await login("landlord-b@poc.local");
    const created = await createProperty(ownerToken, "Private House");
    const propertyId = created.body.property.id as string;

    const read = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    const update = await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ electricityRate: 1, waterRate: 1 });

    expect(read.status).toBe(404);
    expect(update.status).toBe(404);
    expect(read.body.error.code).toBe("PROPERTY_NOT_FOUND");
    expect(update.body.error.code).toBe("PROPERTY_NOT_FOUND");

    const ownerDetail = await request(app)
      .get(`/api/properties/${propertyId}`)
      .set("Authorization", `Bearer ${ownerToken}`);
    expect(ownerDetail.body.property.utilityRates).toBeNull();
  });

  it("resets mutable data and restores seeded login", async () => {
    const token = await login();
    await createProperty(token);

    const reset = await request(app).post("/api/poc/reset");
    expect(reset.status).toBe(200);

    const newToken = await login();
    const properties = await request(app)
      .get("/api/properties")
      .set("Authorization", `Bearer ${newToken}`);
    expect(properties.body.properties).toEqual([]);
  });

  it("does not expose the reset endpoint when LAN mode disables it", async () => {
    const lanApp = createApp({
      database,
      enablePocReset: false,
      jwtSecret: JWT_SECRET,
    });

    const response = await request(lanApp).post("/api/poc/reset");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
