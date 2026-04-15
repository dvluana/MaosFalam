-- Migration: add CHECK constraint to prevent negative credit balance
-- Applied via: npx prisma migrate deploy (Neon develop branch)

ALTER TABLE credit_packs ADD CONSTRAINT credit_packs_remaining_non_negative CHECK (remaining >= 0);
