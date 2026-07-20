-- US-LEASE-05: change lease-expiration reminder offsets from 7/3/1 days
-- to 30/15/7 days.
-- The schema was previously applied via `db:push`, so the starting state has
-- columns: remind_at_7_days, remind_at_3_days, remind_at_1_day.
ALTER TABLE "lease_reminder_configs" RENAME COLUMN "remind_at_3_days" TO "remind_at_15_days";--> statement-breakpoint
ALTER TABLE "lease_reminder_configs" DROP COLUMN IF EXISTS "remind_at_1_day";--> statement-breakpoint
ALTER TABLE "lease_reminder_configs" ADD COLUMN "remind_at_30_days" boolean DEFAULT false NOT NULL;
