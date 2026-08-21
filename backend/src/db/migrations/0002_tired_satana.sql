CREATE TABLE IF NOT EXISTS "lease_co_tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lease_id" uuid NOT NULL,
	"tenant_info_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leases" ADD COLUMN "headcount" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lease_co_tenants" ADD CONSTRAINT "lease_co_tenants_lease_id_leases_id_fk" FOREIGN KEY ("lease_id") REFERENCES "public"."leases"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lease_co_tenants" ADD CONSTRAINT "lease_co_tenants_tenant_info_id_tenant_info_id_fk" FOREIGN KEY ("tenant_info_id") REFERENCES "public"."tenant_info"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lease_co_tenants_unique" ON "lease_co_tenants" USING btree ("lease_id","tenant_info_id");