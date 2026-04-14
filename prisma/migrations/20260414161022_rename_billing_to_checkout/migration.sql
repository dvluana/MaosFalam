/*
  Warnings:

  - You are about to drop the column `abacatepay_billing_id` on the `payments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "payments_abacatepay_billing_id_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "abacatepay_billing_id",
ADD COLUMN     "abacatepay_checkout_id" VARCHAR(100);

-- CreateIndex
CREATE INDEX "payments_abacatepay_checkout_id_idx" ON "payments"("abacatepay_checkout_id");
