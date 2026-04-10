-- CreateEnum
CREATE TYPE "PurgeStatus" AS ENUM ('NONE', 'SCHEDULED', 'PURGED');

-- AlterTable
ALTER TABLE "credential_drafts"
ADD COLUMN "credentialHash" TEXT,
ADD COLUMN "signature" TEXT,
ADD COLUMN "signatoryPubKey" TEXT,
ADD COLUMN "issuedAt" TIMESTAMP(3),
ADD COLUMN "purgeAfterAt" TIMESTAMP(3),
ADD COLUMN "purgedAt" TIMESTAMP(3),
ADD COLUMN "purgeStatus" "PurgeStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN "privacyPolicyVersion" TEXT;

-- CreateTable
CREATE TABLE "compliance_audit_logs" (
  "id" TEXT NOT NULL,
  "draftId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "actorUserId" TEXT,
  "actorMagicTokenHash" TEXT,
  "privacyPolicyVersion" TEXT NOT NULL,
  "actionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,

  CONSTRAINT "compliance_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credential_drafts_credentialHash_key" ON "credential_drafts"("credentialHash");

-- CreateIndex
CREATE INDEX "compliance_audit_logs_draftId_actionTimestamp_idx" ON "compliance_audit_logs"("draftId", "actionTimestamp");

-- AddForeignKey
ALTER TABLE "compliance_audit_logs"
ADD CONSTRAINT "compliance_audit_logs_draftId_fkey"
FOREIGN KEY ("draftId") REFERENCES "credential_drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
