ALTER TABLE "device_tokens" RENAME COLUMN "fcm_token" TO "push_token";--> statement-breakpoint
ALTER TABLE "device_tokens" DROP CONSTRAINT "device_tokens_fcm_token_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "device_tokens_user_token";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "device_tokens_user_token" ON "device_tokens" USING btree ("user_id","push_token");--> statement-breakpoint
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_push_token_unique" UNIQUE("push_token");