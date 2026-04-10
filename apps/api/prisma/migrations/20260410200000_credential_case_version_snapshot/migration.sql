-- CredentialCase + CredentialDraftVersion + IssuedCredentialSnapshot
-- Migrates data from legacy credential_drafts (same case id = former draft id for stable URLs).

-- CreateTable
CREATE TABLE "credential_cases" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "currentVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_draft_versions" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "status" "CredentialStatus" NOT NULL DEFAULT 'DRAFT_SUBMITTED',
    "magicTokenHash" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "consentLogged" BOOLEAN NOT NULL DEFAULT false,
    "hrFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_draft_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issued_credential_snapshots" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "sourceVersionId" TEXT NOT NULL,
    "credentialHash" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "signatoryPubKey" TEXT NOT NULL,
    "contentSnapshot" JSONB NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revocationReason" TEXT,
    "privacyPolicyVersion" TEXT,
    "purgeAfterAt" TIMESTAMP(3),
    "purgedAt" TIMESTAMP(3),
    "purgeStatus" "PurgeStatus" NOT NULL DEFAULT 'NONE',

    CONSTRAINT "issued_credential_snapshots_pkey" PRIMARY KEY ("id")
);

-- Migrate cases + v1 from credential_drafts
INSERT INTO "credential_cases" ("id", "candidateId", "companyId", "createdAt", "updatedAt")
SELECT "id", "candidateId", "companyId", "createdAt", "updatedAt"
FROM "credential_drafts";

WITH ins AS (
  INSERT INTO "credential_draft_versions" (
    "id",
    "caseId",
    "versionNumber",
    "content",
    "status",
    "magicTokenHash",
    "tokenExpiresAt",
    "consentLogged",
    "hrFeedback",
    "reviewedAt",
    "createdAt",
    "updatedAt"
  )
  SELECT
    gen_random_uuid()::text,
    d."id",
    1,
    d."content",
    d."status",
    d."magicTokenHash",
    d."tokenExpiresAt",
    d."consentLogged",
    d."hrFeedback",
    d."reviewedAt",
    d."createdAt",
    d."updatedAt"
  FROM "credential_drafts" d
  RETURNING "id", "caseId"
)
UPDATE "credential_cases" c
SET "currentVersionId" = ins."id"
FROM ins
WHERE c."id" = ins."caseId";

-- Issued snapshots for rows that were ISSUED with a hash
INSERT INTO "issued_credential_snapshots" (
  "id",
  "caseId",
  "sourceVersionId",
  "credentialHash",
  "signature",
  "signatoryPubKey",
  "contentSnapshot",
  "issuedAt",
  "revokedAt",
  "revocationReason",
  "privacyPolicyVersion",
  "purgeAfterAt",
  "purgedAt",
  "purgeStatus"
)
SELECT
  gen_random_uuid()::text,
  d."id",
  v."id",
  d."credentialHash",
  d."signature",
  d."signatoryPubKey",
  d."content",
  d."issuedAt",
  NULL,
  NULL,
  d."privacyPolicyVersion",
  d."purgeAfterAt",
  d."purgedAt",
  d."purgeStatus"
FROM "credential_drafts" d
INNER JOIN "credential_draft_versions" v ON v."caseId" = d."id" AND v."versionNumber" = 1
WHERE d."status" = 'ISSUED' AND d."credentialHash" IS NOT NULL;

-- draft_consent_audits: point to version id (v1 per case)
ALTER TABLE "draft_consent_audits" ADD COLUMN "versionId" TEXT;

UPDATE "draft_consent_audits" a
SET "versionId" = v."id"
FROM "credential_draft_versions" v
WHERE v."caseId" = a."draftId" AND v."versionNumber" = 1;

ALTER TABLE "draft_consent_audits" DROP CONSTRAINT "draft_consent_audits_draftId_fkey";
ALTER TABLE "draft_consent_audits" DROP COLUMN "draftId";
ALTER TABLE "draft_consent_audits" ALTER COLUMN "versionId" SET NOT NULL;

-- compliance_audit_logs
ALTER TABLE "compliance_audit_logs" ADD COLUMN "versionId" TEXT;

UPDATE "compliance_audit_logs" l
SET "versionId" = v."id"
FROM "credential_draft_versions" v
WHERE v."caseId" = l."draftId" AND v."versionNumber" = 1;

ALTER TABLE "compliance_audit_logs" DROP CONSTRAINT "compliance_audit_logs_draftId_fkey";
ALTER TABLE "compliance_audit_logs" DROP COLUMN "draftId";
ALTER TABLE "compliance_audit_logs" ALTER COLUMN "versionId" SET NOT NULL;

-- Drop legacy draft table
DROP TABLE "credential_drafts";

-- CreateIndex / constraints for new tables
CREATE UNIQUE INDEX "credential_cases_currentVersionId_key" ON "credential_cases"("currentVersionId");
CREATE UNIQUE INDEX "credential_draft_versions_magicTokenHash_key" ON "credential_draft_versions"("magicTokenHash");
CREATE UNIQUE INDEX "credential_draft_versions_caseId_versionNumber_key" ON "credential_draft_versions"("caseId", "versionNumber");
CREATE INDEX "credential_draft_versions_caseId_versionNumber_idx" ON "credential_draft_versions"("caseId", "versionNumber");
CREATE INDEX "credential_cases_candidateId_idx" ON "credential_cases"("candidateId");

CREATE UNIQUE INDEX "issued_credential_snapshots_sourceVersionId_key" ON "issued_credential_snapshots"("sourceVersionId");
CREATE UNIQUE INDEX "issued_credential_snapshots_credentialHash_key" ON "issued_credential_snapshots"("credentialHash");
CREATE INDEX "issued_credential_snapshots_caseId_idx" ON "issued_credential_snapshots"("caseId");
CREATE INDEX "issued_credential_snapshots_credentialHash_idx" ON "issued_credential_snapshots"("credentialHash");

CREATE INDEX "draft_consent_audits_versionId_consentCapturedAt_idx" ON "draft_consent_audits"("versionId", "consentCapturedAt");
CREATE INDEX "compliance_audit_logs_versionId_actionTimestamp_idx" ON "compliance_audit_logs"("versionId", "actionTimestamp");

-- Foreign keys
ALTER TABLE "credential_cases"
ADD CONSTRAINT "credential_cases_candidateId_fkey"
FOREIGN KEY ("candidateId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "credential_cases"
ADD CONSTRAINT "credential_cases_companyId_fkey"
FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "credential_cases"
ADD CONSTRAINT "credential_cases_currentVersionId_fkey"
FOREIGN KEY ("currentVersionId") REFERENCES "credential_draft_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "credential_draft_versions"
ADD CONSTRAINT "credential_draft_versions_caseId_fkey"
FOREIGN KEY ("caseId") REFERENCES "credential_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issued_credential_snapshots"
ADD CONSTRAINT "issued_credential_snapshots_caseId_fkey"
FOREIGN KEY ("caseId") REFERENCES "credential_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "issued_credential_snapshots"
ADD CONSTRAINT "issued_credential_snapshots_sourceVersionId_fkey"
FOREIGN KEY ("sourceVersionId") REFERENCES "credential_draft_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "draft_consent_audits"
ADD CONSTRAINT "draft_consent_audits_versionId_fkey"
FOREIGN KEY ("versionId") REFERENCES "credential_draft_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "compliance_audit_logs"
ADD CONSTRAINT "compliance_audit_logs_versionId_fkey"
FOREIGN KEY ("versionId") REFERENCES "credential_draft_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
