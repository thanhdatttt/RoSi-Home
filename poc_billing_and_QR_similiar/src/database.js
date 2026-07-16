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
  name text NOT NULL,
  electricity_rate integer NOT NULL CHECK (electricity_rate >= 0),
  water_rate integer NOT NULL CHECK (water_rate >= 0)
);
CREATE TABLE IF NOT EXISTS rooms (
  id text PRIMARY KEY,
  property_id text NOT NULL REFERENCES properties(id),
  name text NOT NULL,
  base_rent integer NOT NULL CHECK (base_rent >= 0),
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
CREATE TABLE IF NOT EXISTS landlord_payment_settings (
  landlord_id text PRIMARY KEY REFERENCES users(id),
  bank_bin text NOT NULL,
  bank_account text NOT NULL,
  account_holder text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS meter_readings (
  id text PRIMARY KEY,
  room_id text NOT NULL REFERENCES rooms(id),
  period text NOT NULL,
  electricity integer NOT NULL CHECK (electricity >= 0),
  water integer NOT NULL CHECK (water >= 0),
  created_by text NOT NULL REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, period)
);
CREATE TABLE IF NOT EXISTS meter_reading_corrections (
  id text PRIMARY KEY,
  meter_reading_id text NOT NULL REFERENCES meter_readings(id),
  actor_id text NOT NULL REFERENCES users(id),
  previous_electricity integer NOT NULL,
  new_electricity integer NOT NULL,
  previous_water integer NOT NULL,
  new_water integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS invoices (
  id text PRIMARY KEY,
  reference text NOT NULL UNIQUE,
  room_id text NOT NULL REFERENCES rooms(id),
  lease_id text NOT NULL REFERENCES leases(id),
  meter_reading_id text NOT NULL REFERENCES meter_readings(id),
  tenant_id text NOT NULL REFERENCES users(id),
  period text NOT NULL,
  rent_amount integer NOT NULL CHECK (rent_amount >= 0),
  previous_electricity integer NOT NULL,
  current_electricity integer NOT NULL,
  electricity_usage integer NOT NULL,
  electricity_rate integer NOT NULL,
  electricity_amount integer NOT NULL,
  previous_water integer NOT NULL,
  current_water integer NOT NULL,
  water_usage integer NOT NULL,
  water_rate integer NOT NULL,
  water_amount integer NOT NULL,
  additional_fees integer NOT NULL DEFAULT 0,
  total_amount integer NOT NULL CHECK (total_amount >= 0),
  issue_date text NOT NULL,
  due_date text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'proof_submitted', 'paid')),
  vietqr_payload text NOT NULL,
  sent_by text REFERENCES users(id),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, period)
);
CREATE TABLE IF NOT EXISTS billing_run_skips (
  id text PRIMARY KEY,
  owner_id text NOT NULL REFERENCES users(id),
  room_id text NOT NULL REFERENCES rooms(id),
  period text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_proofs (
  id text PRIMARY KEY,
  invoice_id text NOT NULL UNIQUE REFERENCES invoices(id),
  uploaded_by text NOT NULL REFERENCES users(id),
  original_name text NOT NULL,
  mime_type text NOT NULL,
  size integer NOT NULL CHECK (size > 0),
  storage_key text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payments (
  id text PRIMARY KEY,
  invoice_id text NOT NULL UNIQUE REFERENCES invoices(id),
  amount integer NOT NULL CHECK (amount >= 0),
  verified_by text NOT NULL REFERENCES users(id),
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS invoice_status_history (
  id text PRIMARY KEY,
  invoice_id text NOT NULL REFERENCES invoices(id),
  actor_id text NOT NULL REFERENCES users(id),
  previous_status text,
  new_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS notification_events (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES users(id),
  invoice_id text NOT NULL REFERENCES invoices(id),
  type text NOT NULL,
  channel text NOT NULL CHECK (channel = 'mobile_push_simulated'),
  delivery_status text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

export const DEMO = {
  landlordId: 'landlord-poc',
  tenantId: 'tenant-poc',
  unrelatedLandlordId: 'landlord-unrelated',
  unrelatedTenantId: 'tenant-unrelated',
  propertyId: 'property-poc',
  unrelatedPropertyId: 'property-unrelated',
  roomId: 'room-poc',
  missingReadingRoomId: 'room-missing-reading',
  unrelatedRoomId: 'room-unrelated',
  leaseId: 'lease-poc',
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
  const [{ value }] = await db.select({ value: count() }).from(schema.users).where(eq(schema.users.id, DEMO.landlordId));
  if (Number(value) > 0) return;

  await db.insert(schema.users).values([
    { id: DEMO.landlordId, fullName: 'Nguyen Van Chu Nha', role: 'landlord' },
    { id: DEMO.tenantId, fullName: 'Tran Thi Nguoi Thue', role: 'tenant' },
    { id: DEMO.unrelatedLandlordId, fullName: 'Le Van Chu Nha Khac', role: 'landlord' },
    { id: DEMO.unrelatedTenantId, fullName: 'Pham Thi Nguoi Thue Khac', role: 'tenant' },
  ]);

  await db.insert(schema.properties).values([
    {
      id: DEMO.propertyId,
      ownerId: DEMO.landlordId,
      name: 'RosiHome PoC Property',
      electricityRate: 3_500,
      waterRate: 20_000,
    },
    {
      id: DEMO.unrelatedPropertyId,
      ownerId: DEMO.unrelatedLandlordId,
      name: 'Unrelated Property',
      electricityRate: 4_000,
      waterRate: 22_000,
    },
  ]);

  await db.insert(schema.rooms).values([
    { id: DEMO.roomId, propertyId: DEMO.propertyId, name: 'P101', baseRent: 3_000_000 },
    { id: DEMO.missingReadingRoomId, propertyId: DEMO.propertyId, name: 'P102', baseRent: 2_800_000 },
    { id: DEMO.unrelatedRoomId, propertyId: DEMO.unrelatedPropertyId, name: 'X201', baseRent: 4_000_000 },
  ]);

  await db.insert(schema.leases).values([
    {
      id: DEMO.leaseId,
      roomId: DEMO.roomId,
      tenantId: DEMO.tenantId,
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active',
    },
    {
      id: 'lease-missing-reading',
      roomId: DEMO.missingReadingRoomId,
      tenantId: DEMO.tenantId,
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active',
    },
    {
      id: 'lease-unrelated',
      roomId: DEMO.unrelatedRoomId,
      tenantId: DEMO.unrelatedTenantId,
      startsOn: '2026-01-01',
      endsOn: '2026-12-31',
      status: 'active',
    },
  ]);

  await db.insert(schema.landlordPaymentSettings).values([
    {
      landlordId: DEMO.landlordId,
      bankBin: '970422',
      bankAccount: '0123456789',
      accountHolder: 'NGUYEN VAN CHU NHA',
    },
    {
      landlordId: DEMO.unrelatedLandlordId,
      bankBin: '970415',
      bankAccount: '9876543210',
      accountHolder: 'LE VAN CHU NHA KHAC',
    },
  ]);

  await db.insert(schema.meterReadings).values([
    {
      id: 'reading-2026-06',
      roomId: DEMO.roomId,
      period: '2026-06',
      electricity: 1_200,
      water: 80,
      createdBy: DEMO.landlordId,
    },
    {
      id: 'reading-missing-2026-06',
      roomId: DEMO.missingReadingRoomId,
      period: '2026-06',
      electricity: 500,
      water: 30,
      createdBy: DEMO.landlordId,
    },
    {
      id: 'reading-unrelated-2026-06',
      roomId: DEMO.unrelatedRoomId,
      period: '2026-06',
      electricity: 900,
      water: 60,
      createdBy: DEMO.unrelatedLandlordId,
    },
  ]);
}
