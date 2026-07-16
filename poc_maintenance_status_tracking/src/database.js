import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { count, eq } from 'drizzle-orm';
import * as schema from './schema.js';

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id text PRIMARY KEY,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('landlord', 'tenant'))
);
CREATE TABLE IF NOT EXISTS properties (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id),
  name text NOT NULL
);
CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  property_id text NOT NULL REFERENCES properties(id),
  name text NOT NULL,
  UNIQUE (property_id, name)
);
CREATE TABLE IF NOT EXISTS leases (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  tenant_id text NOT NULL REFERENCES users(id),
  starts_on text NOT NULL,
  ends_on text NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'ended'))
);
CREATE TABLE IF NOT EXISTS maintenance_requests (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  tenant_id text NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS maintenance_status_history (
  id text PRIMARY KEY,
  request_id text NOT NULL REFERENCES maintenance_requests(id),
  actor_id text NOT NULL REFERENCES users(id),
  previous_status text,
  new_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notification_events (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  request_id text NOT NULL REFERENCES maintenance_requests(id),
  type text NOT NULL,
  channel text NOT NULL CHECK (channel = 'mobile_push_simulated'),
  delivery_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

export const DEMO = {
  landlordId: 'landlord-maintenance-poc',
  tenantId: 'tenant-maintenance-poc',
  unrelatedLandlordId: 'landlord-maintenance-unrelated',
  unrelatedTenantId: 'tenant-maintenance-unrelated',
  propertyId: 'property-maintenance-poc',
  unrelatedPropertyId: 'property-maintenance-unrelated',
  roomId: 'room-maintenance-p101',
  unrelatedRoomId: 'room-maintenance-x201',
  requestId: 'maintenance-request-pending',
  completedRequestId: 'maintenance-request-completed',
  unrelatedRequestId: 'maintenance-request-unrelated',
};

async function ensureParentDirectory(databasePath) {
  if (databasePath === 'memory://') return;
  await mkdir(path.dirname(path.resolve(databasePath)), { recursive: true });
}

export async function createDatabase(databasePath = 'memory://') {
  await ensureParentDirectory(databasePath);
  const client = new PGlite(databasePath);
  await client.exec(DDL);
  const db = drizzle(client, { schema });
  return { client, db };
}

export async function seedDemo(db) {
  const [{ value }] = await db.select({ value: count() }).from(schema.users)
    .where(eq(schema.users.id, DEMO.landlordId));
  if (Number(value) > 0) return;

  await db.insert(schema.users).values([
    { id: DEMO.landlordId, fullName: 'Nguyen Van Chu Nha', role: 'landlord' },
    { id: DEMO.tenantId, fullName: 'Tran Thi Nguoi Thue', role: 'tenant' },
    { id: DEMO.unrelatedLandlordId, fullName: 'Le Van Chu Nha Khac', role: 'landlord' },
    { id: DEMO.unrelatedTenantId, fullName: 'Pham Thi Nguoi Thue Khac', role: 'tenant' },
  ]);

  await db.insert(schema.properties).values([
    { id: DEMO.propertyId, ownerId: DEMO.landlordId, name: 'RosiHome Nguyen Trai' },
    { id: DEMO.unrelatedPropertyId, ownerId: DEMO.unrelatedLandlordId, name: 'Unrelated Property' },
  ]);

  await db.insert(schema.rooms).values([
    { id: DEMO.roomId, propertyId: DEMO.propertyId, name: 'P101' },
    { id: DEMO.unrelatedRoomId, propertyId: DEMO.unrelatedPropertyId, name: 'X201' },
  ]);

  await db.insert(schema.leases).values([
    {
      id: 'lease-maintenance-poc', roomId: DEMO.roomId, tenantId: DEMO.tenantId,
      startsOn: '2026-01-01', endsOn: '2026-12-31', status: 'active',
    },
    {
      id: 'lease-maintenance-unrelated', roomId: DEMO.unrelatedRoomId,
      tenantId: DEMO.unrelatedTenantId, startsOn: '2026-01-01', endsOn: '2026-12-31', status: 'active',
    },
  ]);

  await db.insert(schema.maintenanceRequests).values([
    {
      id: DEMO.requestId,
      roomId: DEMO.roomId,
      tenantId: DEMO.tenantId,
      title: 'Leaking kitchen sink',
      description: 'Water is leaking below the kitchen sink whenever the tap is used.',
      status: 'pending',
      submittedAt: new Date('2026-07-15T08:00:00Z'),
      updatedAt: new Date('2026-07-15T08:00:00Z'),
    },
    {
      id: DEMO.completedRequestId,
      roomId: DEMO.roomId,
      tenantId: DEMO.tenantId,
      title: 'Broken corridor light',
      description: 'The light outside P101 stopped working and was replaced.',
      status: 'completed',
      submittedAt: new Date('2026-06-10T02:00:00Z'),
      updatedAt: new Date('2026-06-11T06:00:00Z'),
    },
    {
      id: DEMO.unrelatedRequestId,
      roomId: DEMO.unrelatedRoomId,
      tenantId: DEMO.unrelatedTenantId,
      title: 'Air conditioner noise',
      description: 'The air conditioner in X201 makes a loud noise.',
      status: 'pending',
      submittedAt: new Date('2026-07-14T03:00:00Z'),
      updatedAt: new Date('2026-07-14T03:00:00Z'),
    },
  ]);

  await db.insert(schema.maintenanceStatusHistory).values([
    {
      id: 'history-pending-initial', requestId: DEMO.requestId, actorId: DEMO.tenantId,
      previousStatus: null, newStatus: 'pending', createdAt: new Date('2026-07-15T08:00:00Z'),
    },
    {
      id: 'history-completed-initial', requestId: DEMO.completedRequestId, actorId: DEMO.tenantId,
      previousStatus: null, newStatus: 'pending', createdAt: new Date('2026-06-10T02:00:00Z'),
    },
    {
      id: 'history-completed-progress', requestId: DEMO.completedRequestId, actorId: DEMO.landlordId,
      previousStatus: 'pending', newStatus: 'in_progress', createdAt: new Date('2026-06-10T04:00:00Z'),
    },
    {
      id: 'history-completed-final', requestId: DEMO.completedRequestId, actorId: DEMO.landlordId,
      previousStatus: 'in_progress', newStatus: 'completed', createdAt: new Date('2026-06-11T06:00:00Z'),
    },
    {
      id: 'history-unrelated-initial', requestId: DEMO.unrelatedRequestId, actorId: DEMO.unrelatedTenantId,
      previousStatus: null, newStatus: 'pending', createdAt: new Date('2026-07-14T03:00:00Z'),
    },
  ]);
}
