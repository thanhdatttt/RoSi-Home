import "dotenv/config";
import { hashPassword } from "../../src/lib/auth.js";
import { Pool } from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  auth,
  LANDLORD_ID,
  OTHER_LANDLORD_ID,
  PROPERTY_ID,
  resetCommonFixtures,
  setupIntegrationDatabase,
  sign,
  teardownIntegrationDatabase,
  type IntegrationHandles,
} from "./helpers/db.js";

const FIXTURE_PASSWORD = "Landlord123";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

beforeAll(async () => {
  handles = await setupIntegrationDatabase("profile");
  dbPool = handles.dbPool;
  app = handles.app;
});

afterAll(async () => {
  await teardownIntegrationDatabase(handles);
});

beforeEach(async () => {
  const passwordHash = await hashPassword(FIXTURE_PASSWORD);
  await resetCommonFixtures(dbPool);
  await dbPool.query(
    `INSERT INTO users (id, role, username, password_hash)
     VALUES ($1, 'Landlord', 'landlord-a@test.dev', $3),
            ($2, 'Landlord', 'landlord-b@test.dev', $3)`,
    [LANDLORD_ID, OTHER_LANDLORD_ID, passwordHash],
  );
  await dbPool.query(
    `INSERT INTO landlord_profiles (user_id, full_name, email, phone)
     VALUES ($1, 'Landlord A', 'landlord-a@test.dev', '0901112222')`,
    [LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO landlord_profiles (user_id, full_name, email, phone)
     VALUES ($1, 'Landlord B', 'landlord-b@test.dev', '0903334444')`,
    [OTHER_LANDLORD_ID],
  );
  await dbPool.query(
    `INSERT INTO properties (id, landlord_id, name, address)
     VALUES ($1, $2, 'Sunrise House', '123 Le Loi, District 1')`,
    [PROPERTY_ID, LANDLORD_ID],
  );
});

describe("Profile (US-PROFILE-01)", () => {
  it("returns the landlord's own profile", async () => {
    const response = await request(app)
      .get("/api/v1/profile")
      .set(auth(sign("Landlord")))
      .expect(200);

    expect(response.body.data).toMatchObject({
      id: LANDLORD_ID,
      role: "Landlord",
      fullName: "Landlord A",
      email: "landlord-a@test.dev",
    });
  });

  it("updates the landlord's own profile", async () => {
    const response = await request(app)
      .patch("/api/v1/profile")
      .set(auth(sign("Landlord")))
      .send({ fullName: "Landlord A Updated", phone: "0909998888" })
      .expect(200);

    expect(response.body.data).toMatchObject({
      fullName: "Landlord A Updated",
      phone: "0909998888",
    });
  });

  it("rejects an unauthenticated profile read", async () => {
    await request(app).get("/api/v1/profile").expect(401);
  });
});
