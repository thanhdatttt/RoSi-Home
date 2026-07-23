import {
  boolean,
  date,
  decimal,
  foreignKey,
  index,
  jsonb,
  pgEnum,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["Landlord", "Tenant"]);
export const userStatusEnum = pgEnum("user_status", ["Active", "Inactive"]);
export const waterMethodEnum = pgEnum("water_billing_method", ["Metered", "Flat"]);
export const utilityTypeEnum = pgEnum("utility_type", ["Electricity", "Water"]);
export const localityUtilityEnum = pgEnum("locality_utility_type", ["Electricity", "Water"]);
export const leaseStatusEnum = pgEnum("lease_status", ["Active", "Ended", "Expired"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["Draft", "Sent", "Paid"]);
export const paymentProofStatusEnum = pgEnum("payment_proof_status", [
  "Pending",
  "Verified",
]);
export const maintenanceStatusEnum = pgEnum("maintenance_status", [
  "Pending",
  "InProgress",
  "Completed",
]);
export const notificationChannelEnum = pgEnum("notification_channel", ["Push"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["Sent", "Failed"]);
export const platformEnum = pgEnum("platform", ["ios", "android"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  deletedBy: uuid("deleted_by").references(() => users.id),
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: userRoleEnum("role").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  status: userStatusEnum("status").notNull().default("Active"),
  ...timestamps,
});

export const landlordProfiles = pgTable(
  "landlord_profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
  },
  (t) => ({
    uniqueEmail: uniqueIndex("landlord_profiles_email_active").on(t.email),
  }),
);

export const landlordPaymentConfigs = pgTable("landlord_payment_configs", {
  landlordId: uuid("landlord_id")
    .primaryKey()
    .references(() => users.id),
  bankCode: text("bank_code").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tenantInfo = pgTable(
  "tenant_info",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    idNumber: text("id_number").notNull(),
    userId: uuid("user_id").unique().references(() => users.id),
    createdByLandlordId: uuid("created_by_landlord_id")
      .notNull()
      .references(() => users.id),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    uniquePhoneActive: uniqueIndex("tenant_info_phone_active")
      .on(t.phone)
      .where(sql`${t.deletedAt} IS NULL`),
    uniqueEmailActive: uniqueIndex("tenant_info_email_active")
      .on(t.email)
      .where(sql`${t.deletedAt} IS NULL`),
    uniqueIdActive: uniqueIndex("tenant_info_id_active")
      .on(t.idNumber)
      .where(sql`${t.deletedAt} IS NULL`),
  }),
);

export const properties = pgTable(
  "properties",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    landlordId: uuid("landlord_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    address: text("address").notNull(),
    locality: text("locality"),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    uniqueNameActive: uniqueIndex("properties_name_active")
      .on(t.landlordId, t.name)
      .where(sql`${t.deletedAt} IS NULL`),
    uniqueAddressActive: uniqueIndex("properties_address_active")
      .on(t.landlordId, t.address)
      .where(sql`${t.deletedAt} IS NULL`),
  }),
);

export const rooms = pgTable(
  "rooms",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    name: text("name").notNull(),
    baseRent: integer("base_rent").notNull().default(0),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    uniqueNameActive: uniqueIndex("rooms_name_active")
      .on(t.propertyId, t.name)
      .where(sql`${t.deletedAt} IS NULL`),
  }),
);

export const utilityRateHistory = pgTable("utility_rate_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id),
  electricityRatePerKwh: integer("electricity_rate_per_kwh").notNull(),
  waterBillingMethod: waterMethodEnum("water_billing_method").notNull(),
  waterRatePerM3: integer("water_rate_per_m3"),
  waterFlatAmountPerTenant: integer("water_flat_amount_per_tenant"),
  effectiveFrom: date("effective_from").notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const regulatoryRateDefaults = pgTable("regulatory_rate_defaults", {
  id: uuid("id").primaryKey().defaultRandom(),
  utilityType: localityUtilityEnum("utility_type").notNull(),
  locality: text("locality").notNull(),
  method: waterMethodEnum("method").notNull(),
  ratePerUnit: integer("rate_per_unit").notNull(),
  sourceReference: text("source_reference").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"),
});

export const surcharges = pgTable(
  "surcharges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id),
    name: text("name").notNull(),
    monthlyAmount: integer("monthly_amount").notNull().default(0),
    effectiveFrom: date("effective_from").notNull(),
    effectiveTo: date("effective_to"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    activeNameLookup: index("surcharges_name_active")
      .on(t.propertyId, t.name)
      .where(sql`${t.deletedAt} IS NULL AND ${t.active} = true`),
  }),
);

export const leases = pgTable(
  "leases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    tenantInfoId: uuid("tenant_info_id")
      .notNull()
      .references(() => tenantInfo.id),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    actualEndDate: date("actual_end_date"),
    agreedRent: integer("agreed_rent").notNull(),
    deposit: integer("deposit").notNull(),
    status: leaseStatusEnum("status").notNull().default("Active"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    endedBy: uuid("ended_by").references(() => users.id),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    uniqueTenantActive: uniqueIndex("leases_tenant_active")
      .on(t.tenantInfoId)
      .where(sql`${t.deletedAt} IS NULL AND ${t.status} = 'Active'`),
  }),
);

export const leaseReminderConfigs = pgTable("lease_reminder_configs", {
  propertyId: uuid("property_id")
    .primaryKey()
    .references(() => properties.id),
  remindAt30Days: boolean("remind_at_30_days").notNull().default(false),
  remindAt15Days: boolean("remind_at_15_days").notNull().default(false),
  remindAt7Days: boolean("remind_at_7_days").notNull().default(false),
});

export const meterReadings = pgTable(
  "meter_readings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    utilityType: utilityTypeEnum("utility_type").notNull(),
    billingPeriod: text("billing_period").notNull(),
    value: decimal("value", { precision: 18, scale: 4 }).notNull(),
    isInitial: boolean("is_initial").notNull().default(false),
    // Calculation result retained for reproducibility (US-METER-02). Null for
    // initial baseline readings, which create no consumption or charge.
    previousValue: decimal("previous_value", { precision: 18, scale: 4 }),
    consumption: decimal("consumption", { precision: 18, scale: 4 }),
    unitRate: integer("unit_rate"),
    amount: integer("amount").notNull().default(0),
    rateSource: text("rate_source"),
    rateSourceId: uuid("rate_source_id"),
    rateSourceReference: text("rate_source_reference"),
    rateEffectiveFrom: date("rate_effective_from"),
    locality: text("locality"),
    tenantCount: integer("tenant_count"),
    correctionOf: uuid("correction_of"), // self-reference to the superseded reading this row replaces
    supersededAt: timestamp("superseded_at", { withTimezone: true }),
    recordedBy: uuid("recorded_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueReading: uniqueIndex("meter_readings_unique").on(
      t.roomId,
      t.utilityType,
      t.billingPeriod,
      t.supersededAt,
    ),
    correctionFk: foreignKey({
      columns: [t.correctionOf],
      foreignColumns: [t.id],
    }),
  }),
);

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leaseId: uuid("lease_id")
      .notNull()
      .references(() => leases.id),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    billingPeriod: text("billing_period").notNull(),
    status: invoiceStatusEnum("status").notNull().default("Draft"),
    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    totalAmount: integer("total_amount").notNull().default(0),
    sentBy: uuid("sent_by").references(() => users.id),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => ({
    uniqueLeasePeriodActive: uniqueIndex("invoices_lease_period_active")
      .on(t.leaseId, t.billingPeriod)
      .where(sql`${t.deletedAt} IS NULL`),
  }),
);

export const invoiceGenerationSkips = pgTable("invoice_generation_skips", {
  id: uuid("id").primaryKey().defaultRandom(),
  leaseId: uuid("lease_id")
    .notNull()
    .references(() => leases.id),
  billingPeriod: text("billing_period").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id),
  type: text("type").notNull(),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 18, scale: 4 }),
  unitRate: integer("unit_rate"),
  amount: integer("amount").notNull(),
  sourceRateId: uuid("source_rate_id"),
});

export const paymentProofs = pgTable("payment_proofs", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoices.id),
  tenantInfoId: uuid("tenant_info_id")
    .notNull()
    .references(() => tenantInfo.id),
  fileUrl: text("file_url").notNull(),
  status: paymentProofStatusEnum("status").notNull().default("Pending"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoiceId: uuid("invoice_id")
      .notNull()
      .unique()
      .references(() => invoices.id),
    proofId: uuid("proof_id").references(() => paymentProofs.id),
    amount: integer("amount").notNull(),
    verifiedBy: uuid("verified_by")
      .notNull()
      .references(() => users.id),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueInvoice: uniqueIndex("payments_invoice_unique").on(t.invoiceId),
  }),
);

export const maintenanceRequests = pgTable(
  "maintenance_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
      .notNull()
      .references(() => rooms.id),
    tenantInfoId: uuid("tenant_info_id")
      .notNull()
      .references(() => tenantInfo.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    status: maintenanceStatusEnum("status").notNull().default("Pending"),
    submittedAt: timestamp("submitted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
);

export const maintenancePhotos = pgTable("maintenance_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => maintenanceRequests.id),
  fileUrl: text("file_url").notNull(),
});

export const maintenanceStatusHistory = pgTable("maintenance_status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  requestId: uuid("request_id")
    .notNull()
    .references(() => maintenanceRequests.id),
  fromStatus: text("from_status").notNull(),
  toStatus: text("to_status").notNull(),
  changedBy: uuid("changed_by")
    .notNull()
    .references(() => users.id),
  changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  linkRef: text("link_ref"),
  channel: notificationChannelEnum("channel").notNull().default("Push"),
  deliveryStatus: deliveryStatusEnum("delivery_status").notNull().default("Sent"),
  dedupeKey: text("dedupe_key"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deviceTokens = pgTable(
  "device_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    // Expo push token, e.g. "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]".
    // Column kept generic (not fcm_token) because RosiHome uses Expo's push
    // service instead of calling FCM/APNs directly (see lib/expoPush.ts).
    pushToken: text("push_token").notNull().unique(),
    platform: platformEnum("platform").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    uniqueToken: uniqueIndex("device_tokens_user_token").on(t.userId, t.pushToken),
  }),
);

export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id").notNull(),
  beforeValue: jsonb("before_value"),
  afterValue: jsonb("after_value"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const refreshTokens = pgTable("rosihome_refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  landlordId: uuid("landlord_id")
    .notNull()
    .references(() => users.id),
  periodType: text("period_type").notNull(),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  snapshot: text("snapshot").notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emailSendQueue = pgTable("email_send_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
});
