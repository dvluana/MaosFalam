-- CreateTable
CREATE TABLE "leads" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(10) NOT NULL DEFAULT 'female',
    "session_id" VARCHAR(64) NOT NULL,
    "clerk_user_id" VARCHAR(100),
    "email_opt_in" BOOLEAN NOT NULL DEFAULT false,
    "source" VARCHAR(50) NOT NULL DEFAULT 'organic',
    "converted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "clerk_user_id" VARCHAR(100) NOT NULL,
    "lead_id" UUID,
    "cpf" VARCHAR(14),
    "phone" VARCHAR(20),
    "abacatepay_customer_id" VARCHAR(100),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("clerk_user_id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" UUID NOT NULL,
    "lead_id" UUID,
    "clerk_user_id" VARCHAR(100),
    "session_id" VARCHAR(64),
    "target_name" VARCHAR(100) NOT NULL,
    "target_gender" VARCHAR(10) NOT NULL DEFAULT 'female',
    "is_self" BOOLEAN NOT NULL DEFAULT true,
    "attributes" JSONB NOT NULL,
    "report" JSONB NOT NULL,
    "tier" VARCHAR(10) NOT NULL DEFAULT 'free',
    "confidence" DECIMAL(3,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_packs" (
    "id" UUID NOT NULL,
    "clerk_user_id" VARCHAR(100) NOT NULL,
    "payment_id" UUID,
    "pack_type" VARCHAR(20) NOT NULL,
    "total" INTEGER NOT NULL,
    "remaining" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_packs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "clerk_user_id" VARCHAR(100) NOT NULL,
    "reading_id" UUID,
    "abacatepay_billing_id" VARCHAR(100),
    "pack_type" VARCHAR(20) NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "method" VARCHAR(10),
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_session_id_idx" ON "leads"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_lead_id_key" ON "user_profiles"("lead_id");

-- CreateIndex
CREATE INDEX "readings_clerk_user_id_idx" ON "readings"("clerk_user_id");

-- CreateIndex
CREATE INDEX "readings_lead_id_idx" ON "readings"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_packs_payment_id_key" ON "credit_packs"("payment_id");

-- CreateIndex
CREATE INDEX "credit_packs_clerk_user_id_idx" ON "credit_packs"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reading_id_key" ON "payments"("reading_id");

-- CreateIndex
CREATE INDEX "payments_abacatepay_billing_id_idx" ON "payments"("abacatepay_billing_id");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_packs" ADD CONSTRAINT "credit_packs_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "user_profiles"("clerk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_packs" ADD CONSTRAINT "credit_packs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_clerk_user_id_fkey" FOREIGN KEY ("clerk_user_id") REFERENCES "user_profiles"("clerk_user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_reading_id_fkey" FOREIGN KEY ("reading_id") REFERENCES "readings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
