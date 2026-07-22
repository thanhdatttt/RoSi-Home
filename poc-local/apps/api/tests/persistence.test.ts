import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db/client.js";
import {
  DEMO_PASSWORD,
  initializeDatabase,
} from "../src/db/initialize.js";

const JWT_SECRET = "persistence-secret-sixteen-characters";

it("persists an owned property after closing and reopening PGlite", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "rosi-home-poc-"));
  const dataDir = join(temporaryRoot, "database");

  try {
    const firstDatabase = await createDatabase(dataDir);
    await initializeDatabase(firstDatabase);
    const firstApp = createApp({ database: firstDatabase, jwtSecret: JWT_SECRET });

    const firstLogin = await request(firstApp).post("/api/auth/login").send({
      email: "landlord-a@poc.local",
      password: DEMO_PASSWORD,
    });
    const created = await request(firstApp)
      .post("/api/properties")
      .set("Authorization", `Bearer ${firstLogin.body.token as string}`)
      .send({ name: "Persistent House", address: "77 Restart Avenue" });
    expect(created.status).toBe(201);
    const propertyId = created.body.property.id as string;

    await firstDatabase.client.close();

    const secondDatabase = await createDatabase(dataDir);
    try {
      await initializeDatabase(secondDatabase);
      const secondApp = createApp({
        database: secondDatabase,
        jwtSecret: JWT_SECRET,
      });
      const secondLogin = await request(secondApp).post("/api/auth/login").send({
        email: "landlord-a@poc.local",
        password: DEMO_PASSWORD,
      });
      const detail = await request(secondApp)
        .get(`/api/properties/${propertyId}`)
        .set("Authorization", `Bearer ${secondLogin.body.token as string}`);

      expect(detail.status).toBe(200);
      expect(detail.body.property).toMatchObject({
        id: propertyId,
        name: "Persistent House",
        address: "77 Restart Avenue",
      });
    } finally {
      await secondDatabase.client.close();
    }
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
