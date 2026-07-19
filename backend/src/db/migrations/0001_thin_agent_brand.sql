DROP INDEX IF EXISTS "surcharges_name_active";--> statement-breakpoint
ALTER TABLE "audit_events" ALTER COLUMN "before_value" SET DATA TYPE jsonb USING "before_value"::jsonb;--> statement-breakpoint
ALTER TABLE "audit_events" ALTER COLUMN "after_value" SET DATA TYPE jsonb USING "after_value"::jsonb;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "surcharges_name_active" ON "surcharges" USING btree ("property_id","name") WHERE "surcharges"."deleted_at" IS NULL AND "surcharges"."active" = true;
