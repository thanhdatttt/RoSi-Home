import "dotenv/config";
import { hashPassword } from "../../lib/auth.js";
import { db } from "../index.js";
import {
  landlordProfiles,
  leases,
  properties,
  regulatoryRateDefaults,
  rooms,
  tenantInfo,
  users,
} from "../schema.js";

const LANDLORD_EMAIL = "tkchi23@clc.fitus.edu.vn";
const TENANT_EMAIL = "chitrankhon@gmail.com";
const SEED_PASSWORD = "Test1234";

// Fixed-ish ids so the seeded data is idempotent and easy to reference
// while testing (e.g. in API calls or the mobile app).
const LANDLORD_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_USER_ID = "22222222-2222-4222-8222-222222222222";
const PROPERTY_ID = "33333333-3333-4333-8333-333333333333";
const ROOM_ID = "44444444-4444-4444-8444-444444444444";
const TENANT_INFO_ID = "55555555-5555-4555-8555-555555555555";
const LEASE_ID = "66666666-6666-4666-8666-666666666666";

export async function seedRegulatoryRateDefaults(): Promise<void> {
  const existing = await db
    .select({ id: regulatoryRateDefaults.id })
    .from(regulatoryRateDefaults)
    .limit(1);
  if (existing.length > 0) {
    console.info("Regulatory rate defaults already seeded; skipping.");
    return;
  }
  // PD-03: seed defaults versioned by source, locality, effective date.
  // Replace with official Vietnam rental electricity / water tariffs for your locality.
  await db.insert(regulatoryRateDefaults).values([
    {
      utilityType: "Electricity",
      locality: "HN",
      method: "Metered",
      ratePerUnit: 3500,
      sourceReference: "Example: EVN retail tariff (replace with official citation)",
      effectiveFrom: "2024-01-01",
    },
    {
      utilityType: "Water",
      locality: "HN",
      method: "Metered",
      ratePerUnit: 15000,
      sourceReference: "Example: Hanoi water tariff (replace with official citation)",
      effectiveFrom: "2024-01-01",
    },
  ]);
  console.info("Seeded regulatory rate defaults.");
}

// Idempotent demo data so you can log in and exercise the app freely.
// Landlord: tkchi23@clc.fitus.edu.vn / Test1234
// Tenant:  chitrankhon@gmail.com / Test1234 (provisioned account)
export async function seedDemoData(): Promise<void> {
  const passwordHash = await hashPassword(SEED_PASSWORD);

  // --- Landlord user + profile -------------------------------------
  await db
    .insert(users)
    .values({
      id: LANDLORD_ID,
      role: "Landlord",
      username: LANDLORD_EMAIL,
      passwordHash,
      mustChangePassword: false,
      status: "Active",
    })
    .onConflictDoNothing();

  await db
    .insert(landlordProfiles)
    .values({
      userId: LANDLORD_ID,
      fullName: "Test Landlord",
      email: LANDLORD_EMAIL,
      phone: "0901112222",
    })
    .onConflictDoNothing();

  // --- Tenant user (provisioned account) ---------------------------
  await db
    .insert(users)
    .values({
      id: TENANT_USER_ID,
      role: "Tenant",
      username: "0902223333",
      passwordHash,
      mustChangePassword: false,
      status: "Active",
    })
    .onConflictDoNothing();

  // --- Property + room ----------------------------------------------
  await db
    .insert(properties)
    .values({
      id: PROPERTY_ID,
      landlordId: LANDLORD_ID,
      name: "Sunrise Demo House",
      address: "123 Le Loi, District 1",
      locality: "HN",
    })
    .onConflictDoNothing();

  await db
    .insert(rooms)
    .values({
      id: ROOM_ID,
      propertyId: PROPERTY_ID,
      name: "Room 101",
      baseRent: 3000000,
    })
    .onConflictDoNothing();

  // --- Tenant info (linked via lease) ----------------------------
  await db
    .insert(tenantInfo)
    .values({
      id: TENANT_INFO_ID,
      fullName: "Test Tenant",
      phone: "0902223333",
      email: TENANT_EMAIL,
      idNumber: "07911122233",
      userId: TENANT_USER_ID,
      createdByLandlordId: LANDLORD_ID,
    })
    .onConflictDoNothing();

  // --- Active lease (makes the room Occupied) -------------------
  await db
    .insert(leases)
    .values({
      id: LEASE_ID,
      roomId: ROOM_ID,
      tenantInfoId: TENANT_INFO_ID,
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      agreedRent: 3000000,
      deposit: 3000000,
      status: "Active",
      createdBy: LANDLORD_ID,
    })
    .onConflictDoNothing();

  console.info(
    `Seeded demo data. Landlord ${LANDLORD_EMAIL} and tenant ${TENANT_EMAIL} (password ${SEED_PASSWORD}).`,
  );
}

async function main(): Promise<void> {
  await seedRegulatoryRateDefaults();
  await seedDemoData();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
