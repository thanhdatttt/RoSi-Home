import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import request from "supertest";
import { expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createDatabase } from "../src/db/client.js";
import { DEMO_PASSWORD, initializeDatabase } from "../src/db/initialize.js";

const JWT_SECRET = "billing-persistence-secret-characters";

it("persists the invoice snapshot, state, and bank configuration after reopening PGlite", async () => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "rosi-billing-poc-"));
  const dataDir = join(temporaryRoot, "database");

  try {
    const firstDatabase = await createDatabase(dataDir);
    await initializeDatabase(firstDatabase);
    const firstApp = createApp({ database: firstDatabase, jwtSecret: JWT_SECRET });
    const login = await request(firstApp).post("/api/auth/login").send({
      email: "landlord-a@poc.local",
      password: DEMO_PASSWORD,
    });
    const token = login.body.token as string;
    const property = await request(firstApp)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Persistent Billing", address: "9 Snapshot Street" });
    const propertyId = property.body.property.id as string;
    await request(firstApp)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: 3_500, waterRate: 18_000 });
    const generated = await request(firstApp)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({
        propertyId,
        roomReference: "A.01",
        tenantName: "Persistent Tenant",
        billingPeriod: "2026-08",
        issueDate: "2026-08-01",
        dueDate: "2026-08-10",
        baseRent: 5_000_000,
        previousElectricity: "10",
        currentElectricity: "12.5",
        previousWater: "5",
        currentWater: "6",
      });
    const invoiceId = generated.body.invoice.id as string;
    await request(firstApp)
      .post(`/api/billing/invoices/${invoiceId}/send`)
      .set("Authorization", `Bearer ${token}`);
    await request(firstApp)
      .put("/api/billing/bank-account")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bankBin: "970436",
        accountNumber: "DEMO12345",
        accountName: "SYNTHETIC DEMO",
      });
    await firstDatabase.client.close();

    const secondDatabase = await createDatabase(dataDir);
    try {
      await initializeDatabase(secondDatabase);
      const secondApp = createApp({ database: secondDatabase, jwtSecret: JWT_SECRET });
      const reopenedLogin = await request(secondApp).post("/api/auth/login").send({
        email: "landlord-a@poc.local",
        password: DEMO_PASSWORD,
      });
      const reopenedToken = reopenedLogin.body.token as string;
      const detail = await request(secondApp)
        .get(`/api/billing/invoices/${invoiceId}`)
        .set("Authorization", `Bearer ${reopenedToken}`);
      const qr = await request(secondApp)
        .get(`/api/billing/invoices/${invoiceId}/vietqr`)
        .set("Authorization", `Bearer ${reopenedToken}`);

      expect(detail.status).toBe(200);
      expect(detail.body.invoice).toMatchObject({
        id: invoiceId,
        roomReference: "A.01",
        status: "Sent",
        total: 5_026_750,
      });
      expect(qr.status).toBe(200);
      expect(qr.body.vietqr.structuralValidation).toBe("passed");
    } finally {
      await secondDatabase.client.close();
    }
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
});
