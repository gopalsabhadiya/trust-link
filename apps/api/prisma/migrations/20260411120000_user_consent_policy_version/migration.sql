-- AlterTable
ALTER TABLE "users" ADD COLUMN "consentPolicyVersion" TEXT;

-- Data fix: clear PII retained on snapshots already marked PURGED (DPDP minimization)
UPDATE "issued_credential_snapshots"
SET "contentSnapshot" = '{}'::jsonb
WHERE "purgeStatus" = 'PURGED';
