import dotenv from 'dotenv'
import { neon } from '@neondatabase/serverless'

dotenv.config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL)

const statements = [
  'ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "voided_at" timestamp',
  'ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "voided_by" integer',
  'ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "void_reason" text',
  `DO $$
BEGIN
  ALTER TABLE "sales"
    ADD CONSTRAINT "sales_voided_by_users_id_fk"
    FOREIGN KEY ("voided_by") REFERENCES "users"("id");
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$`,
]

for (const statement of statements) {
  await sql.query(statement, [])
}

console.log('sale void audit migration applied')
