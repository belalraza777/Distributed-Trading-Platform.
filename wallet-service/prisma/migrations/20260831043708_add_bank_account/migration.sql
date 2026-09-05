-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_holder" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "ifsc_code" TEXT NOT NULL,
    "bank_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_user_id_key" ON "BankAccount"("user_id");
