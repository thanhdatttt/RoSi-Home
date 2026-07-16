import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { parseTlv, verifyVietQrCrc } from '../src/vietqr.js';

const SECRET = 'integration-test-secret-with-at-least-32-chars';
const VALID_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function login(app, userId) {
  const response = await request(app).post('/api/auth/demo').send({ userId }).expect(200);
  return response.body.token;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test('RosiHome synchronized billing PoC acceptance suite POC-01 through POC-20', async (t) => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'rosihome-billing-poc-v2-'));
  const databasePath = path.join(temporaryDirectory, 'database');
  const storagePath = path.join(temporaryDirectory, 'storage');
  let runtime = await createApp({ databasePath, storagePath, jwtSecret: SECRET });
  let landlordToken = await login(runtime.app, runtime.demo.landlordId);
  let tenantToken = await login(runtime.app, runtime.demo.tenantId);
  const unrelatedLandlordToken = await login(runtime.app, runtime.demo.unrelatedLandlordId);
  const unrelatedTenantToken = await login(runtime.app, runtime.demo.unrelatedTenantId);
  let reading;
  let invoice;

  t.after(async () => {
    await runtime.client.close().catch(() => {});
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  await t.test('POC-01 stores utility rates at property level and enforces ownership', async () => {
    const updated = await request(runtime.app)
      .patch(`/api/properties/${runtime.demo.propertyId}/utility-rates`)
      .set(auth(landlordToken))
      .send({ electricityRate: 3_500, waterRate: 20_000 })
      .expect(200);
    assert.equal(updated.body.electricityRate, 3_500);
    assert.equal(updated.body.waterRate, 20_000);

    await request(runtime.app)
      .patch(`/api/properties/${runtime.demo.propertyId}/utility-rates`)
      .set(auth(unrelatedLandlordToken))
      .send({ electricityRate: 1, waterRate: 1 })
      .expect(403);
  });

  await t.test('POC-02 rejects readings lower than the immediately preceding reading', async () => {
    const response = await request(runtime.app)
      .post('/api/meter-readings')
      .set(auth(landlordToken))
      .send({ roomId: runtime.demo.roomId, period: '2026-07', electricity: 1_199, water: 79 })
      .expect(400);
    assert.match(response.body.error, /greater than or equal/i);
  });

  await t.test('POC-03 records monthly readings and returns reproducible charges', async () => {
    const response = await request(runtime.app)
      .post('/api/meter-readings')
      .set(auth(landlordToken))
      .send({ roomId: runtime.demo.roomId, period: '2026-07', electricity: 1_320, water: 84 })
      .expect(201);
    reading = response.body;
    assert.equal(reading.previous.electricity, 1_200);
    assert.equal(reading.calculation.electricityUsage, 120);
    assert.equal(reading.calculation.electricityAmount, 420_000);
    assert.equal(reading.calculation.waterUsage, 4);
    assert.equal(reading.calculation.waterAmount, 80_000);

    await request(runtime.app)
      .post('/api/meter-readings')
      .set(auth(landlordToken))
      .send({ roomId: runtime.demo.roomId, period: '2026-07', electricity: 1_320, water: 84 })
      .expect(409);
  });

  await t.test('POC-04 billing run creates one Draft and records a missing-reading skip', async () => {
    const response = await request(runtime.app)
      .post('/api/billing-runs')
      .set(auth(landlordToken))
      .send({ period: '2026-07', issueDate: '2026-07-01', dueDate: '2026-07-05' })
      .expect(201);
    assert.equal(response.body.created.length, 1);
    assert.ok(response.body.skipped.some((item) => (
      item.roomId === runtime.demo.missingReadingRoomId && item.reason === 'missing_current_reading'
    )));
    invoice = response.body.created[0];
    assert.equal(invoice.reference, 'INV.POC.001');
    assert.equal(invoice.status, 'draft');
    assert.equal(invoice.previousElectricity, 1_200);
    assert.equal(invoice.currentElectricity, 1_320);
    assert.equal(invoice.electricityRate, 3_500);
    assert.equal(invoice.electricityAmount, 420_000);
    assert.equal(invoice.waterRate, 20_000);
    assert.equal(invoice.waterAmount, 80_000);
    assert.equal(invoice.totalAmount, 3_500_000);
    assert.equal(invoice.issueDate, '2026-07-01');
    assert.equal(invoice.dueDate, '2026-07-05');
  });

  await t.test('POC-05 repeated billing does not create a duplicate invoice', async () => {
    const response = await request(runtime.app)
      .post('/api/billing-runs')
      .set(auth(landlordToken))
      .send({ period: '2026-07', issueDate: '2026-07-01', dueDate: '2026-07-05' })
      .expect(201);
    assert.equal(response.body.created.length, 0);
    assert.ok(response.body.skipped.some((item) => (
      item.roomId === runtime.demo.roomId && item.reason === 'already_invoiced'
    )));
    const list = await request(runtime.app).get('/api/invoices').set(auth(landlordToken)).expect(200);
    assert.equal(list.body.length, 1);
  });

  await t.test('POC-06 Draft invoice is landlord-only', async () => {
    const list = await request(runtime.app).get('/api/invoices').set(auth(tenantToken)).expect(200);
    assert.deepEqual(list.body, []);
    await request(runtime.app).get(`/api/invoices/${invoice.id}`).set(auth(tenantToken)).expect(403);
  });

  await t.test('POC-07 Draft reading correction is audited and recalculates the invoice', async () => {
    const changed = await request(runtime.app)
      .patch(`/api/meter-readings/${reading.id}`)
      .set(auth(landlordToken))
      .send({ electricity: 1_321, water: 85 })
      .expect(200);
    assert.equal(changed.body.changed, true);
    assert.equal(changed.body.invoice.totalAmount, 3_523_500);

    const restored = await request(runtime.app)
      .patch(`/api/meter-readings/${reading.id}`)
      .set(auth(landlordToken))
      .send({ electricity: 1_320, water: 84 })
      .expect(200);
    assert.equal(restored.body.invoice.totalAmount, 3_500_000);
    invoice = restored.body.invoice;

    const corrections = await request(runtime.app)
      .get(`/api/meter-readings/${reading.id}/corrections`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(corrections.body.length, 2);
    assert.equal(corrections.body[0].previousElectricity, 1_320);
    assert.equal(corrections.body[0].newElectricity, 1_321);
  });

  await t.test('POC-08 landlord sends the Draft exactly once and tenant receives a simulated push event', async () => {
    const sent = await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/send`)
      .set(auth(landlordToken))
      .expect(200);
    invoice = sent.body;
    assert.equal(invoice.status, 'sent');
    assert.equal(invoice.sentBy, runtime.demo.landlordId);
    assert.ok(invoice.sentAt);

    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/send`)
      .set(auth(landlordToken))
      .expect(409);

    const notifications = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(notifications.body[0].type, 'invoice_sent');
    assert.equal(notifications.body[0].channel, 'mobile_push_simulated');
  });

  await t.test('POC-09 assigned tenant can view Sent invoice but reading can no longer be corrected', async () => {
    const visible = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}`)
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(visible.body.totalAmount, 3_500_000);
    await request(runtime.app)
      .patch(`/api/meter-readings/${reading.id}`)
      .set(auth(landlordToken))
      .send({ electricity: 1_321, water: 84 })
      .expect(409);
  });

  await t.test('POC-10 VietQR contains the configured account, exact amount, and deterministic reference', () => {
    assert.equal(verifyVietQrCrc(invoice.vietQrPayload), true);
    const root = parseTlv(invoice.vietQrPayload);
    const merchant = parseTlv(root['38']);
    const beneficiary = parseTlv(merchant['01']);
    const additional = parseTlv(root['62']);
    assert.equal(beneficiary['00'], '970422');
    assert.equal(beneficiary['01'], '0123456789');
    assert.equal(root['54'], '3500000');
    assert.equal(additional['08'], 'INV.POC.001');
    assert.match(invoice.qrDataUrl, /^data:image\/png;base64,/);
  });

  await t.test('POC-11 authorized PDF matches the invoice and unrelated users are denied', async () => {
    const pdf = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/pdf`)
      .set(auth(tenantToken))
      .expect('Content-Type', /application\/pdf/)
      .expect(200);
    assert.equal(pdf.body.subarray(0, 8).toString('ascii'), '%PDF-1.4');
    assert.match(pdf.body.toString('ascii'), /Total: 3500000 VND/);

    await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/pdf`)
      .set(auth(unrelatedTenantToken))
      .expect(403);
  });

  await t.test('POC-12 rejects unsupported, oversized, empty, and forged image uploads', async () => {
    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(tenantToken))
      .attach('proof', Buffer.from('not an image'), { filename: 'malware.exe', contentType: 'application/octet-stream' })
      .expect(400);

    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(tenantToken))
      .attach('proof', Buffer.from('forged png'), { filename: 'forged.png', contentType: 'image/png' })
      .expect(400);

    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(tenantToken))
      .attach('proof', Buffer.alloc(0), { filename: 'empty.png', contentType: 'image/png' })
      .expect(400);

    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(tenantToken))
      .attach('proof', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'too-large.png', contentType: 'image/png' })
      .expect(400);
  });

  await t.test('POC-13 unrelated tenant cannot submit proof', async () => {
    await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(unrelatedTenantToken))
      .attach('proof', VALID_PNG, { filename: 'other.png', contentType: 'image/png' })
      .expect(403);
  });

  await t.test('POC-14 assigned tenant submits valid proof and landlord receives a simulated push event', async () => {
    const uploaded = await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/proof`)
      .set(auth(tenantToken))
      .attach('proof', VALID_PNG, { filename: 'payment-proof.png', contentType: 'image/png' })
      .expect(201);
    invoice = uploaded.body;
    assert.equal(invoice.status, 'proof_submitted');
    assert.equal(invoice.proof.originalName, 'payment-proof.png');

    const notifications = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(notifications.body[0].type, 'payment_proof_submitted');
  });

  await t.test('POC-15 owning landlord can list and retrieve pending proof; unrelated landlord cannot', async () => {
    const pending = await request(runtime.app)
      .get('/api/payment-proofs/pending')
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(pending.body.length, 1);
    assert.equal(pending.body[0].id, invoice.id);

    const proof = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/proof`)
      .set(auth(landlordToken))
      .expect('Content-Type', /image\/png/)
      .expect(200);
    assert.ok(proof.body.equals(VALID_PNG));

    await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/proof`)
      .set(auth(unrelatedLandlordToken))
      .expect(403);
    const unrelatedPending = await request(runtime.app)
      .get('/api/payment-proofs/pending')
      .set(auth(unrelatedLandlordToken))
      .expect(200);
    assert.deepEqual(unrelatedPending.body, []);
  });

  await t.test('POC-16 manual confirmation creates one Payment and is idempotent', async () => {
    const confirmed = await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/confirm`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(confirmed.body.changed, true);
    assert.equal(confirmed.body.invoice.status, 'paid');
    assert.equal(confirmed.body.invoice.payment.amount, 3_500_000);
    assert.equal(confirmed.body.invoice.payment.verifiedBy, runtime.demo.landlordId);
    invoice = confirmed.body.invoice;

    const repeated = await request(runtime.app)
      .post(`/api/invoices/${invoice.id}/confirm`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(repeated.body.changed, false);
    assert.equal(repeated.body.invoice.payment.id, invoice.payment.id);
  });

  await t.test('POC-17 landlord and tenant share payment history with zero paid outstanding balance', async () => {
    const [landlord, tenant, unrelated] = await Promise.all([
      request(runtime.app).get('/api/payments/summary').set(auth(landlordToken)).expect(200),
      request(runtime.app).get('/api/payments/summary').set(auth(tenantToken)).expect(200),
      request(runtime.app).get('/api/payments/summary').set(auth(unrelatedTenantToken)).expect(200),
    ]);
    assert.equal(landlord.body.outstandingTotal, 0);
    assert.deepEqual(landlord.body.history, tenant.body.history);
    assert.ok(landlord.body.history[0].verificationDate);
    assert.deepEqual(unrelated.body.history, []);
  });

  await t.test('POC-18 status history is complete and repeated actions create no duplicate transitions', async () => {
    const history = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/history`)
      .set(auth(tenantToken))
      .expect(200);
    assert.deepEqual(history.body.history.map((entry) => entry.newStatus), [
      'draft', 'sent', 'proof_submitted', 'paid',
    ]);
    assert.equal(history.body.history.filter((entry) => entry.newStatus === 'paid').length, 1);
  });

  await t.test('POC-19 unrelated users cannot access invoice details or values', async () => {
    const response = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}`)
      .set(auth(unrelatedLandlordToken))
      .expect(403);
    assert.equal(JSON.stringify(response.body).includes('3500000'), false);
  });

  await t.test('POC-20 invoice, proof, payment, and history persist after database restart', async () => {
    await runtime.client.close();
    runtime = await createApp({ databasePath, storagePath, jwtSecret: SECRET });
    landlordToken = await login(runtime.app, runtime.demo.landlordId);
    tenantToken = await login(runtime.app, runtime.demo.tenantId);

    const persisted = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}`)
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(persisted.body.status, 'paid');
    assert.equal(persisted.body.payment.amount, 3_500_000);
    assert.equal(persisted.body.proof.originalName, 'payment-proof.png');

    const history = await request(runtime.app)
      .get(`/api/invoices/${invoice.id}/history`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(history.body.history.length, 4);
  });
});
