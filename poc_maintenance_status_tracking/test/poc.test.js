import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const SECRET = 'maintenance-integration-test-secret-32-chars';

async function login(app, userId) {
  const response = await request(app).post('/api/auth/demo').send({ userId }).expect(200);
  return response.body.token;
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test('RosiHome Maintenance Status Tracking PoC acceptance suite POC-M-01 through POC-M-12', async (t) => {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'rosihome-maintenance-poc-'));
  const databasePath = path.join(temporaryDirectory, 'database');
  let runtime = await createApp({ databasePath, jwtSecret: SECRET });
  let landlordToken = await login(runtime.app, runtime.demo.landlordId);
  let tenantToken = await login(runtime.app, runtime.demo.tenantId);
  const unrelatedLandlordToken = await login(runtime.app, runtime.demo.unrelatedLandlordId);
  const unrelatedTenantToken = await login(runtime.app, runtime.demo.unrelatedTenantId);

  t.after(async () => {
    await runtime.client.close().catch(() => {});
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  await t.test('POC-M-01 owning landlord lists and filters only owned requests', async () => {
    const all = await request(runtime.app)
      .get('/api/maintenance-requests')
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(all.body.length, 2);
    assert.ok(all.body.every((item) => item.property.id === runtime.demo.propertyId));

    const pending = await request(runtime.app)
      .get('/api/maintenance-requests?status=pending')
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(pending.body.length, 1);
    assert.equal(pending.body[0].id, runtime.demo.requestId);

    const completed = await request(runtime.app)
      .get('/api/maintenance-requests?status=completed')
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(completed.body.length, 1);
    assert.equal(completed.body[0].id, runtime.demo.completedRequestId);
  });

  await t.test('POC-M-02 reviewing details exposes context without changing status', async () => {
    const first = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(first.body.status, 'pending');
    assert.equal(first.body.room.name, 'P101');
    assert.equal(first.body.tenant.id, runtime.demo.tenantId);
    assert.deepEqual(first.body.attachments, []);
    assert.equal(first.body.history.length, 1);

    const second = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(second.body.status, 'pending');
    assert.equal(second.body.history.length, 1);
  });

  await t.test('POC-M-03 unrelated landlord and tenant cannot access request details', async () => {
    await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(unrelatedLandlordToken))
      .expect(403);
    const denied = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(unrelatedTenantToken))
      .expect(403);
    assert.equal(JSON.stringify(denied.body).includes('Leaking kitchen sink'), false);
  });

  await t.test('POC-M-04 tenants list only requests linked to their own tenant relationship', async () => {
    const tenantList = await request(runtime.app)
      .get('/api/maintenance-requests')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(tenantList.body.length, 2);
    assert.ok(tenantList.body.every((item) => item.tenant.id === runtime.demo.tenantId));

    const unrelatedList = await request(runtime.app)
      .get('/api/maintenance-requests')
      .set(auth(unrelatedTenantToken))
      .expect(200);
    assert.equal(unrelatedList.body.length, 1);
    assert.equal(unrelatedList.body[0].id, runtime.demo.unrelatedRequestId);
  });

  await t.test('POC-M-05 Pending cannot skip directly to Completed', async () => {
    const response = await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(landlordToken))
      .send({ status: 'completed' })
      .expect(409);
    assert.match(response.body.error, /only to in_progress/i);
  });

  await t.test('POC-M-06 owning landlord changes Pending to In Progress with audit and notification', async () => {
    const response = await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(landlordToken))
      .send({ status: 'in_progress' })
      .expect(200);
    assert.equal(response.body.changed, true);
    assert.equal(response.body.request.status, 'in_progress');
    assert.deepEqual(response.body.request.history.map((item) => item.newStatus), ['pending', 'in_progress']);
    assert.equal(response.body.request.history.at(-1).actorId, runtime.demo.landlordId);

    const events = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(events.body.length, 1);
    assert.equal(events.body[0].requestId, runtime.demo.requestId);
    assert.equal(events.body[0].channel, 'mobile_push_simulated');
  });

  await t.test('POC-M-07 repeated same-status update is idempotent', async () => {
    const repeated = await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(landlordToken))
      .send({ status: 'in_progress' })
      .expect(200);
    assert.equal(repeated.body.changed, false);
    assert.equal(repeated.body.request.history.length, 2);

    const events = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(events.body.length, 1);
  });

  await t.test('POC-M-08 tenant and unrelated landlord cannot update status', async () => {
    await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(tenantToken))
      .send({ status: 'completed' })
      .expect(403);
    await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(unrelatedLandlordToken))
      .send({ status: 'completed' })
      .expect(403);

    const unchanged = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(unchanged.body.status, 'in_progress');
  });

  await t.test('POC-M-09 In Progress changes to Completed and creates exactly one more notification', async () => {
    const response = await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(landlordToken))
      .send({ status: 'completed' })
      .expect(200);
    assert.equal(response.body.changed, true);
    assert.equal(response.body.request.status, 'completed');
    assert.deepEqual(response.body.request.history.map((item) => item.newStatus), [
      'pending', 'in_progress', 'completed',
    ]);

    const events = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(events.body.length, 2);
    assert.ok(events.body.every((event) => event.channel === 'mobile_push_simulated'));
  });

  await t.test('POC-M-10 Completed request cannot be reopened or moved backward', async () => {
    const response = await request(runtime.app)
      .patch(`/api/maintenance-requests/${runtime.demo.requestId}/status`)
      .set(auth(landlordToken))
      .send({ status: 'in_progress' })
      .expect(409);
    assert.match(response.body.error, /no further status/i);
  });

  await t.test('POC-M-11 room history retains completed requests and enforces ownership', async () => {
    const history = await request(runtime.app)
      .get(`/api/rooms/${runtime.demo.roomId}/maintenance-history`)
      .set(auth(landlordToken))
      .expect(200);
    assert.equal(history.body.requests.length, 2);
    assert.ok(history.body.requests.every((item) => item.status === 'completed'));
    assert.ok(history.body.requests.every((item) => item.history.at(-1).newStatus === 'completed'));

    await request(runtime.app)
      .get(`/api/rooms/${runtime.demo.unrelatedRoomId}/maintenance-history`)
      .set(auth(landlordToken))
      .expect(403);
    await request(runtime.app)
      .get(`/api/rooms/${runtime.demo.roomId}/maintenance-history`)
      .set(auth(tenantToken))
      .expect(403);
  });

  await t.test('POC-M-12 status, history, and notifications persist after restart', async () => {
    await runtime.client.close();
    runtime = await createApp({ databasePath, jwtSecret: SECRET });
    landlordToken = await login(runtime.app, runtime.demo.landlordId);
    tenantToken = await login(runtime.app, runtime.demo.tenantId);

    const persisted = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(persisted.body.status, 'completed');
    assert.equal(persisted.body.history.length, 3);

    const notifications = await request(runtime.app)
      .get('/api/notifications')
      .set(auth(tenantToken))
      .expect(200);
    assert.equal(notifications.body.length, 2);

    const landlordView = await request(runtime.app)
      .get(`/api/maintenance-requests/${runtime.demo.requestId}`)
      .set(auth(landlordToken))
      .expect(200);
    assert.deepEqual(landlordView.body.history, persisted.body.history);
  });
});
