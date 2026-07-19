ALTER TABLE "meter_readings" ADD COLUMN "previous_value" numeric(18, 4);--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "consumption" numeric(18, 4);--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "unit_rate" integer;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "rate_source" text;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "rate_source_reference" text;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "rate_effective_from" date;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "locality" text;--> statement-breakpoint
ALTER TABLE "meter_readings" ADD COLUMN "tenant_count" integer;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "locality" text;