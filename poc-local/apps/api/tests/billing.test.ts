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

const JWT_SECRET = "billing-test-secret-sixteen-characters";

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

async function setupProperty(token: string, name = "Billing House") {
  const created = await request(app)
    .post("/api/properties")
    .set("Authorization", `Bearer ${token}`)
    .send({ name, address: "88 Calculation Avenue" });
  expect(created.status).toBe(201);
  const propertyId = created.body.property.id as string;
  const rates = await request(app)
    .put(`/api/properties/${propertyId}/utility-rates`)
    .set("Authorization", `Bearer ${token}`)
    .send({ electricityRate: 3_500, waterRate: 18_000 });
  expect(rates.status).toBe(200);
  return propertyId;
}

function invoiceInput(propertyId: string) {
  return {
    propertyId,
    roomReference: "p.101",
    tenantName: "Synthetic Tenant",
    billingPeriod: "2026-07",
    issueDate: "2026-07-01",
    dueDate: "2026-07-10",
    baseRent: 4_000_000,
    previousElectricity: "100.125",
    currentElectricity: "112.625",
    previousWater: "20",
    currentWater: "22.333",
  };
}

async function generateInvoice(token: string, propertyId: string) {
  return request(app)
    .post("/api/billing/invoices")
    .set("Authorization", `Bearer ${token}`)
    .send(invoiceInput(propertyId));
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

describe("billing and VietQR hard-problem slice", () => {
  it("calculates fractional consumption with integer half-up VND snapshots", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    const response = await generateInvoice(token, propertyId);

    expect(response.status).toBe(201);
    expect(response.body.replayed).toBe(false);
    expect(response.body.invoice).toMatchObject({
      roomReference: "P.101",
      status: "Draft",
      electricityCharge: 43_750,
      waterCharge: 41_994,
      total: 4_085_744,
    });
    expect(response.body.invoice.inputSnapshot).toMatchObject({
      calculationPolicy: "MILLI_UNIT_HALF_UP_V1",
      previousElectricity: "100.125",
      currentElectricity: "112.625",
      previousWater: "20",
      currentWater: "22.333",
      electricityRate: 3_500,
      waterRate: 18_000,
    });
    expect(response.body.invoice.lineItems).toEqual([
      { amount: 4_000_000, code: "BASE_RENT", description: "Base rent" },
      {
        amount: 43_750,
        code: "ELECTRICITY",
        description: "Electricity",
        quantity: "12.5",
        rate: 3_500,
      },
      {
        amount: 41_994,
        code: "WATER",
        description: "Water",
        quantity: "2.333",
        rate: 18_000,
      },
    ]);
  });

  it("rounds a half VND upward using integer arithmetic", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: 1, waterRate: 0 });
    const input = {
      ...invoiceInput(propertyId),
      currentElectricity: "100.625",
      currentWater: "20",
      baseRent: 0,
    };
    const response = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send(input);

    expect(response.status).toBe(201);
    expect(response.body.invoice.electricityCharge).toBe(1);
    expect(response.body.invoice.total).toBe(1);
  });

  it("rejects decreasing readings and missing property rates", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    const decreasing = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...invoiceInput(propertyId),
        currentElectricity: "99.999",
      });
    expect(decreasing.status).toBe(422);
    expect(decreasing.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "currentElectricity" }),
      ]),
    );

    const propertyWithoutRates = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "No Rate House", address: "11 Missing Rate Road" });
    const noRates = await generateInvoice(
      token,
      propertyWithoutRates.body.property.id as string,
    );
    expect(noRates.status).toBe(409);
    expect(noRates.body.error.code).toBe("UTILITY_RATES_REQUIRED");

    const unsafeRoom = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...invoiceInput(propertyId), roomReference: "P-101" });
    expect(unsafeRoom.status).toBe(422);
  });

  it("rejects a total that exceeds VietQR's 13-digit amount contract", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: 1_000_000_000, waterRate: 0 });
    const response = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...invoiceInput(propertyId),
        previousElectricity: "0",
        currentElectricity: "10000",
        previousWater: "0",
        currentWater: "0",
      });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe("INVOICE_AMOUNT_TOO_LARGE");
  });

  it("replays identical normalized input and rejects conflicting input", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    const first = await generateInvoice(token, propertyId);
    const replay = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({
        ...invoiceInput(propertyId),
        roomReference: "P.101",
        previousWater: "20.000",
      });
    const conflict = await request(app)
      .post("/api/billing/invoices")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...invoiceInput(propertyId), baseRent: 4_000_001 });

    expect(replay.status).toBe(200);
    expect(replay.body.replayed).toBe(true);
    expect(replay.body.invoice.id).toBe(first.body.invoice.id);
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe("INVOICE_ALREADY_EXISTS");

    const listed = await request(app)
      .get(`/api/billing/invoices?propertyId=${propertyId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(listed.body.invoices).toHaveLength(1);
  });

  it("keeps the invoice snapshot unchanged after property rates change", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    const generated = await generateInvoice(token, propertyId);
    const invoiceId = generated.body.invoice.id as string;

    await request(app)
      .put(`/api/properties/${propertyId}/utility-rates`)
      .set("Authorization", `Bearer ${token}`)
      .send({ electricityRate: 9_999, waterRate: 99_999 });
    const detail = await request(app)
      .get(`/api/billing/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(detail.body.invoice.total).toBe(4_085_744);
    expect(detail.body.invoice.electricityRate).toBe(3_500);
    expect(detail.body.invoice.waterRate).toBe(18_000);
  });

  it("sends exactly once and generates deterministic locally validated VietQR", async () => {
    const token = await login();
    const propertyId = await setupProperty(token);
    const generated = await generateInvoice(token, propertyId);
    const invoiceId = generated.body.invoice.id as string;

    const draftQr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}/vietqr`)
      .set("Authorization", `Bearer ${token}`);
    expect(draftQr.status).toBe(409);
    expect(draftQr.body.error.code).toBe("INVOICE_NOT_SENT");

    const firstSend = await request(app)
      .post(`/api/billing/invoices/${invoiceId}/send`)
      .set("Authorization", `Bearer ${token}`);
    const replaySend = await request(app)
      .post(`/api/billing/invoices/${invoiceId}/send`)
      .set("Authorization", `Bearer ${token}`);
    expect(firstSend.body.invoice.status).toBe("Sent");
    expect(replaySend.body.invoice.sentAt).toBe(firstSend.body.invoice.sentAt);

    const missingBankQr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}/vietqr`)
      .set("Authorization", `Bearer ${token}`);
    expect(missingBankQr.status).toBe(409);
    expect(missingBankQr.body.error.code).toBe("BANK_ACCOUNT_REQUIRED");

    const bank = await request(app)
      .put("/api/billing/bank-account")
      .set("Authorization", `Bearer ${token}`)
      .send({
        bankBin: "970436",
        accountNumber: "1017595600",
        accountName: "SYNTHETIC DEMO",
      });
    expect(bank.status).toBe(200);

    const firstQr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}/vietqr`)
      .set("Authorization", `Bearer ${token}`);
    const secondQr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}/vietqr`)
      .set("Authorization", `Bearer ${token}`);
    expect(firstQr.status).toBe(200);
    expect(firstQr.body.vietqr).toMatchObject({
      amount: 4_085_744,
      invoiceId,
      remark: "ROSI P.101 202607",
      status: "Sent",
      structuralValidation: "passed",
    });
    expect(firstQr.body.vietqr.payload).toBe(secondQr.body.vietqr.payload);
    expect(firstQr.body.vietqr.qrDataUrl).toBe(secondQr.body.vietqr.qrDataUrl);
    expect(firstQr.body.vietqr.qrDataUrl).toMatch(/^data:image\/png;base64,/);

    const afterQr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(afterQr.body.invoice.status).toBe("Sent");
  });

  it("hides invoice detail, send, VietQR, and property-filtered list from another landlord", async () => {
    const ownerToken = await login("landlord-a@poc.local");
    const otherToken = await login("landlord-b@poc.local");
    const propertyId = await setupProperty(ownerToken, "Owner A Billing House");
    const generated = await generateInvoice(ownerToken, propertyId);
    const invoiceId = generated.body.invoice.id as string;

    const detail = await request(app)
      .get(`/api/billing/invoices/${invoiceId}`)
      .set("Authorization", `Bearer ${otherToken}`);
    const send = await request(app)
      .post(`/api/billing/invoices/${invoiceId}/send`)
      .set("Authorization", `Bearer ${otherToken}`);
    const qr = await request(app)
      .get(`/api/billing/invoices/${invoiceId}/vietqr`)
      .set("Authorization", `Bearer ${otherToken}`);
    const list = await request(app)
      .get(`/api/billing/invoices?propertyId=${propertyId}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(detail.status).toBe(404);
    expect(send.status).toBe(404);
    expect(qr.status).toBe(404);
    expect(list.status).toBe(404);
  });
});
