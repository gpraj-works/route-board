DO $$ BEGIN
  CREATE TYPE "public"."subscription_status" AS ENUM('trial', 'active', 'past_due', 'cancelled', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "city" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "state" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "zip_code" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "country" text NOT NULL DEFAULT 'US';--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trial_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "trial_ends_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "subscription_status" "public"."subscription_status" DEFAULT 'trial' NOT NULL;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "payment_customer_id" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "payment_subscription_id" text;--> statement-breakpoint
UPDATE "companies" SET
  "trial_started_at" = now(),
  "trial_ends_at" = now() + INTERVAL '14 days'
WHERE "trial_started_at" IS NULL;