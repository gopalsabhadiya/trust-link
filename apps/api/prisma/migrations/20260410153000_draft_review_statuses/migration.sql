-- AlterEnum
ALTER TYPE "CredentialStatus" ADD VALUE 'HR_APPROVED';
ALTER TYPE "CredentialStatus" ADD VALUE 'REVISIONS_REQUIRED';

-- AlterTable
ALTER TABLE "credential_drafts"
ADD COLUMN "hrFeedback" TEXT,
ADD COLUMN "reviewedAt" TIMESTAMP(3);
