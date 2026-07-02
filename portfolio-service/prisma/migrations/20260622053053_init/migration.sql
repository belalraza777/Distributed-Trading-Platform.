-- CreateTable
CREATE TABLE "Holding" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "avg_buy_price" DECIMAL(18,2) NOT NULL,
    "current_price" DECIMAL(18,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Holding_user_id_idx" ON "Holding"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_user_id_symbol_key" ON "Holding"("user_id", "symbol");
