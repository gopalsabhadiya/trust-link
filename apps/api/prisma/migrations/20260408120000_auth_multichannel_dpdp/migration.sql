-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('MANUAL', 'GOOGLE', 'LINKEDIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "consentGiven" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentTimestamp" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "users_authProvider_externalId_idx" ON "users"("authProvider", "externalId");
