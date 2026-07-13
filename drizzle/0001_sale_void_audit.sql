ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "voided_at" timestamp;
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "voided_by" integer;
ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "void_reason" text;

DO $$
BEGIN
  ALTER TABLE "sales"
    ADD CONSTRAINT "sales_voided_by_users_id_fk"
    FOREIGN KEY ("voided_by") REFERENCES "users"("id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
