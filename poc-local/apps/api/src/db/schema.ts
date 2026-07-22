import {
  bigint,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export interface InvoiceLineItem {
  amount: number;
  code: "BASE_RENT" | "ELECTRICITY" | "WATER";
  description: string;
  quantity?: string;
  rate?: number;
}

export interface InvoiceInputSnapshot {
  baseRent: number;
  billingPeriod: string;
  calculationPolicy: "MILLI_UNIT_HALF_UP_V1";
  currentElectricity: string;
  currentWater: string;
  dueDate: string;
  electricityRate: number;
  issueDate: string;
  previousElectricity: string;
  previousWater: string;
  roomReference: string;
  tenantName: string;
  waterRate: number;
}

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  passwordHash: text("password_hash").notNull(),
  passwordSalt: text("password_salt").notNull(),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  landlordId: text("landlord_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const utilityRates = pgTable("utility_rates", {
  propertyId: text("property_id")
    .primaryKey()
    .references(() => properties.id, { onDelete: "cascade" }),
  electricityRate: integer("electricity_rate").notNull(),
  waterRate: integer("water_rate").notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const bankAccounts = pgTable("bank_accounts", {
  landlordId: text("landlord_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bankBin: text("bank_bin").notNull(),
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const invoices = pgTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    propertyId: text("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    roomReference: text("room_reference").notNull(),
    tenantName: text("tenant_name").notNull(),
    billingPeriod: text("billing_period").notNull(),
    issueDate: text("issue_date").notNull(),
    dueDate: text("due_date").notNull(),
    baseRent: bigint("base_rent", { mode: "number" }).notNull(),
    previousElectricity: text("previous_electricity").notNull(),
    currentElectricity: text("current_electricity").notNull(),
    previousWater: text("previous_water").notNull(),
    currentWater: text("current_water").notNull(),
    electricityRate: integer("electricity_rate").notNull(),
    waterRate: integer("water_rate").notNull(),
    electricityCharge: bigint("electricity_charge", { mode: "number" }).notNull(),
    waterCharge: bigint("water_charge", { mode: "number" }).notNull(),
    lineItems: jsonb("line_items").$type<InvoiceLineItem[]>().notNull(),
    inputSnapshot: jsonb("input_snapshot")
      .$type<InvoiceInputSnapshot>()
      .notNull(),
    inputFingerprint: text("input_fingerprint").notNull(),
    total: bigint("total", { mode: "number" }).notNull(),
    status: text("status").$type<"Draft" | "Sent">().notNull(),
    createdAt: timestamp("created_at", { mode: "string", withTimezone: true })
      .defaultNow()
      .notNull(),
    sentAt: timestamp("sent_at", { mode: "string", withTimezone: true }),
  },
  (table) => [
    uniqueIndex("invoices_property_room_period_uidx").on(
      table.propertyId,
      table.roomReference,
      table.billingPeriod,
    ),
  ],
);
