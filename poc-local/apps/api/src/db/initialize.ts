import { eq } from "drizzle-orm";
import type { DatabaseConnection } from "./client.js";
import { users } from "./schema.js";
import { hashPassword } from "../lib/password.js";

export const DEMO_PASSWORD = "demo-password";

export const demoUsers = [
  {
    id: "landlord-a",
    email: "landlord-a@poc.local",
    displayName: "Landlord A",
  },
  {
    id: "landlord-b",
    email: "landlord-b@poc.local",
    displayName: "Landlord B",
  },
] as const;

const schemaSql = `
  CREATE TABLE IF NOT EXISTS users (
    id text PRIMARY KEY,
    email text NOT NULL UNIQUE,
    display_name text NOT NULL,
    password_hash text NOT NULL,
    password_salt text NOT NULL,
    role text NOT NULL CHECK (role = 'Landlord'),
    created_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS properties (
    id text PRIMARY KEY,
    landlord_id text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name text NOT NULL,
    address text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS properties_landlord_id_idx
    ON properties(landlord_id);

  CREATE TABLE IF NOT EXISTS utility_rates (
    property_id text PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
    electricity_rate integer NOT NULL CHECK (electricity_rate >= 0),
    water_rate integer NOT NULL CHECK (water_rate >= 0),
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS bank_accounts (
    landlord_id text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bank_bin text NOT NULL CHECK (bank_bin ~ '^[0-9]{6}$'),
    account_number text NOT NULL CHECK (account_number ~ '^[A-Za-z0-9]{5,19}$'),
    account_name text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id text PRIMARY KEY,
    property_id text NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_reference text NOT NULL,
    tenant_name text NOT NULL,
    billing_period text NOT NULL,
    issue_date text NOT NULL,
    due_date text NOT NULL,
    base_rent bigint NOT NULL CHECK (base_rent >= 0),
    previous_electricity text NOT NULL,
    current_electricity text NOT NULL,
    previous_water text NOT NULL,
    current_water text NOT NULL,
    electricity_rate integer NOT NULL CHECK (electricity_rate >= 0),
    water_rate integer NOT NULL CHECK (water_rate >= 0),
    electricity_charge bigint NOT NULL CHECK (electricity_charge >= 0),
    water_charge bigint NOT NULL CHECK (water_charge >= 0),
    line_items jsonb NOT NULL,
    input_snapshot jsonb NOT NULL,
    input_fingerprint text NOT NULL,
    total bigint NOT NULL CHECK (total >= 0),
    status text NOT NULL CHECK (status IN ('Draft', 'Sent')),
    created_at timestamptz NOT NULL DEFAULT now(),
    sent_at timestamptz,
    CONSTRAINT invoices_property_room_period_unique
      UNIQUE(property_id, room_reference, billing_period)
  );

  CREATE INDEX IF NOT EXISTS invoices_property_id_idx
    ON invoices(property_id);
`;

async function seedDemoUsers(connection: DatabaseConnection): Promise<void> {
  for (const demoUser of demoUsers) {
    const password = hashPassword(DEMO_PASSWORD);
    await connection.db
      .insert(users)
      .values({
        ...demoUser,
        passwordHash: password.hash,
        passwordSalt: password.salt,
        role: "Landlord",
      })
      .onConflictDoNothing({ target: users.id });
  }
}

export async function initializeDatabase(
  connection: DatabaseConnection,
): Promise<void> {
  await connection.client.exec(schemaSql);
  await seedDemoUsers(connection);
}

export async function resetDatabase(
  connection: DatabaseConnection,
): Promise<void> {
  await connection.client.exec(`
    DELETE FROM invoices;
    DELETE FROM bank_accounts;
    DELETE FROM utility_rates;
    DELETE FROM properties;
    DELETE FROM users;
  `);
  await seedDemoUsers(connection);
}

export async function demoUserExists(
  connection: DatabaseConnection,
  id: string,
): Promise<boolean> {
  const row = await connection.db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return row.length === 1;
}
