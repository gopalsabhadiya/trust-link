-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('DRAFT_SUBMITTED', 'HR_REVIEWING', 'ISSUED', 'REJECTED');

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_drafts" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "magicTokenHash" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "consentLogged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "draft_consent_audits" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" "CredentialStatus" NOT NULL,
    "consentStatementVersion" TEXT NOT NULL,
    "consentCapturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipHash" TEXT,
    "userAgentHash" TEXT,

    CONSTRAINT "draft_consent_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credential_drafts_magicTokenHash_key" ON "credential_drafts"("magicTokenHash");

-- CreateIndex
CREATE INDEX "credential_drafts_tokenExpiresAt_status_idx" ON "credential_drafts"("tokenExpiresAt", "status");

-- CreateIndex
CREATE INDEX "draft_consent_audits_draftId_consentCapturedAt_idx" ON "draft_consent_audits"("draftId", "consentCapturedAt");

-- AddForeignKey
ALTER TABLE "credential_drafts" ADD CONSTRAINT "credential_drafts_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_drafts" ADD CONSTRAINT "credential_drafts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_consent_audits" ADD CONSTRAINT "draft_consent_audits_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "credential_drafts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "draft_consent_audits" ADD CONSTRAINT "draft_consent_audits_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
