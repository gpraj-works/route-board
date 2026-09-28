ALTER TYPE "public"."user_role" ADD VALUE IF NOT EXISTS 'staff';--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."user_status" AS ENUM('active', 'deactivated');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "status" "public"."user_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
UPDATE "users" u SET "name" = a."name" FROM "agents" a WHERE a."user_id" = u."id" AND u."name" IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_company_id_owner_unique_idx" ON "users" ("company_id") WHERE role = 'owner';
