import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull(),
});

export const properties = pgTable('properties', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  propertyId: text('property_id').notNull().references(() => properties.id),
  name: text('name').notNull(),
});

export const leases = pgTable('leases', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  tenantId: text('tenant_id').notNull().references(() => users.id),
  startsOn: text('starts_on').notNull(),
  endsOn: text('ends_on').notNull(),
  status: text('status').notNull(),
});

export const maintenanceRequests = pgTable('maintenance_requests', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id),
  tenantId: text('tenant_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const maintenanceStatusHistory = pgTable('maintenance_status_history', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull().references(() => maintenanceRequests.id),
  actorId: text('actor_id').notNull().references(() => users.id),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notificationEvents = pgTable('notification_events', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  requestId: text('request_id').notNull().references(() => maintenanceRequests.id),
  type: text('type').notNull(),
  channel: text('channel').notNull(),
  deliveryStatus: text('delivery_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
