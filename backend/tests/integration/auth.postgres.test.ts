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
  teardownIntegrationDatabase,
  type IntegrationHandles,
} from "./helpers/db.js";

const FIXTURE_PASSWORD = "Landlord123";

let handles: IntegrationHandles;
let dbPool: Pool;
let app: import("express").Express;

beforeAll(async () => {
  handles = await setupIntegrationDatabase("auth");
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

describe("Auth (US-AUTH-01/02/03/04/05/06)", () => {
  const password = "Landlord123";

  it("registers a landlord and creates the profile row", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "New Landlord",
        email: "new-landlord@test.dev",
        password,
        passwordConfirmation: password,
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      role: "Landlord",
    });

    const profile = await dbPool.query(
      "SELECT full_name, email FROM landlord_profiles WHERE email = $1",
      ["new-landlord@test.dev"],
    );
    expect(profile.rows).toHaveLength(1);
  });

  it("rejects duplicate registration with 409", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Dup",
        email: "landlord-a@test.dev",
        password,
        passwordConfirmation: password,
      })
      .expect(409);
  });

  it("rejects mismatched password confirmation with 400", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({
        fullName: "Mismatch",
        email: "mismatch@test.dev",
        password,
        passwordConfirmation: "Different123",
      })
      .expect(400);
  });

  it("logs in and returns an access + refresh token pair", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password: "wrong" })
      .expect(401);
    expect(response.body.error.code).toBe("UNAUTHENTICATED");

    const ok = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password })
      .expect(200);
    expect(ok.body.data).toHaveProperty("accessToken");
    expect(ok.body.data).toHaveProperty("refreshToken");
  });

  it("rotates the refresh token and revokes the old one on /refresh", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password })
      .expect(200);
    const oldRefresh = login.body.data.refreshToken;

    const refreshed = await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh })
      .expect(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
    expect(refreshed.body.data.refreshToken).not.toBe(oldRefresh);

    // The old refresh token must now be rejected.
    await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken: oldRefresh })
      .expect(401);
  });

  it("revokes the refresh token on logout", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password })
      .expect(200);
    const refreshToken = login.body.data.refreshToken;
    const accessToken = login.body.data.accessToken;

    await request(app)
      .post("/api/v1/auth/logout")
      .set(auth(accessToken))
      .send({ refreshToken })
      .expect(200);

    await request(app)
      .post("/api/v1/auth/refresh")
      .send({ refreshToken })
      .expect(401);
  });

  it("changes the password and rejects reuse of the old password", async () => {
    const login = await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password })
      .expect(200);
    const accessToken = login.body.data.accessToken;

    await request(app)
      .post("/api/v1/auth/change-password")
      .set(auth(accessToken))
      .send({
        currentPassword: password,
        newPassword: "UpdatedPass123",
        newPasswordConfirmation: "UpdatedPass123",
      })
      .expect(200);

    // Old password no longer works.
    await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password })
      .expect(401);

    // New password works.
    await request(app)
      .post("/api/v1/auth/login")
      .send({ username: "landlord-a@test.dev", password: "UpdatedPass123" })
      .expect(200);
  });

  it("hides account existence on forgot-password (always 200)", async () => {
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "does-not-exist@test.dev" })
      .expect(200);
  });
});
