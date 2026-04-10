-- Persist invited HR email for authenticated review authorization
ALTER TABLE "credential_draft_versions" ADD COLUMN "hrReviewEmail" TEXT;
