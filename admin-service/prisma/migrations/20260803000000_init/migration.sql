CREATE TABLE "banned_users" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedBy" INTEGER NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banned_users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "banned_users_userId_key" ON "banned_users"("userId");
