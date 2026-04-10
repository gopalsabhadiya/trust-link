import type { CredentialStatus } from "./credentials";

/** One row in the HR credential-requests inbox (current version only). */
export interface HrCredentialRequestItemDTO {
  caseId: string;
  versionId: string;
  candidateId: string;
  candidateName: string;
  /** Public avatar URL when set. */
  profilePicture: string | null;
  designation: string;
  companyName: string;
  status: CredentialStatus;
  /** ISO timestamp — `CredentialDraftVersion.createdAt` for this version (submission received). */
  dateReceived: string;
  /** ISO timestamp — `CredentialDraftVersion.updatedAt` (sort key). */
  updatedAt: string;
}

export interface HrCredentialRequestsResponseDTO {
  requests: HrCredentialRequestItemDTO[];
  /** Current-version drafts awaiting HR action (submitted / reviewing / pre-issue). */
  pendingActionCount: number;
}
