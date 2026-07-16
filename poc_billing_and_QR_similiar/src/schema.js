import {
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
});

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  electricityRate: integer('electricity_rate').notNull(),
  waterRate: integer('water_rate').notNull(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id),
  name: text('name').notNull(),
  baseRent: integer('base_rent').notNull(),
});

export const leases = pgTable('leases', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  tenantId: text('tenant_id').notNull().references(() => users.id),
  startsOn: text('starts_on').notNull(),
  endsOn: text('ends_on').notNull(),
  status: text('status').notNull(),
});

export const landlordPaymentSettings = pgTable('landlord_payment_settings', {
  landlordId: text('landlord_id').primaryKey().references(() => users.id),
  bankBin: text('bank_bin').notNull(),
  bankAccount: text('bank_account').notNull(),
  accountHolder: text('account_holder').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const meterReadings = pgTable('meter_readings', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  period: text('period').notNull(),
  electricity: integer('electricity').notNull(),
  water: integer('water').notNull(),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('meter_room_period_unique').on(table.roomId, table.period)]);

export const meterReadingCorrections = pgTable('meter_reading_corrections', {
  id: text('id').primaryKey(),
  meterReadingId: text('meter_reading_id').notNull().references(() => meterReadings.id),
  actorId: text('actor_id').notNull().references(() => users.id),
  previousElectricity: integer('previous_electricity').notNull(),
  newElectricity: integer('new_electricity').notNull(),
  previousWater: integer('previous_water').notNull(),
  newWater: integer('new_water').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  reference: text('reference').notNull().unique(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  leaseId: text('lease_id').notNull().references(() => leases.id),
  meterReadingId: text('meter_reading_id').notNull().references(() => meterReadings.id),
  tenantId: text('tenant_id').notNull().references(() => users.id),
  period: text('period').notNull(),
  rentAmount: integer('rent_amount').notNull(),
  previousElectricity: integer('previous_electricity').notNull(),
  currentElectricity: integer('current_electricity').notNull(),
  electricityUsage: integer('electricity_usage').notNull(),
  electricityRate: integer('electricity_rate').notNull(),
  electricityAmount: integer('electricity_amount').notNull(),
  previousWater: integer('previous_water').notNull(),
  currentWater: integer('current_water').notNull(),
  waterUsage: integer('water_usage').notNull(),
  waterRate: integer('water_rate').notNull(),
  waterAmount: integer('water_amount').notNull(),
  additionalFees: integer('additional_fees').notNull(),
  totalAmount: integer('total_amount').notNull(),
  issueDate: text('issue_date').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull(),
  vietQrPayload: text('vietqr_payload').notNull(),
  sentBy: text('sent_by').references(() => users.id),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex('invoice_room_period_unique').on(table.roomId, table.period)]);

export const billingRunSkips = pgTable('billing_run_skips', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  roomId: text('room_id').notNull().references(() => rooms.id),
  period: text('period').notNull(),
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const paymentProofs = pgTable('payment_proofs', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id).unique(),
  uploadedBy: text('uploaded_by').notNull().references(() => users.id),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  storageKey: text('storage_key').notNull(),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id).unique(),
  amount: integer('amount').notNull(),
  verifiedBy: text('verified_by').notNull().references(() => users.id),
  verifiedAt: timestamp('verified_at', { withTimezone: true }).notNull().defaultNow(),
});

export const invoiceStatusHistory = pgTable('invoice_status_history', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  actorId: text('actor_id').notNull().references(() => users.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notificationEvents = pgTable('notification_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id),
  type: text('type').notNull(),
  channel: text('channel').notNull(),
  deliveryStatus: text('delivery_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
