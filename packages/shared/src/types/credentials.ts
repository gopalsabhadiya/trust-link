export interface IExperienceLetter {
  employeeName: string;
  designation: string;
  joiningDate: string;
  relievingDate: string;
  keyAchievements: string[];
  /** Optional honors; omit or use empty array when none. */
  awards?: string[];
  companyName: string;
  hrSignatoryName: string;
}

export type CredentialStatus =
  | "DRAFT_SUBMITTED"
  | "HR_REVIEWING"
  | "HR_APPROVED"
  | "REVISIONS_REQUIRED"
  | "ISSUED"
  | "REJECTED";

export type DraftReviewAction = "APPROVE" | "REQUEST_REVISION";

/** `id` is the credential case id (stable for /dashboard/issued/[id]). */
export interface DraftReviewPublicDTO {
  id: string;
  status: CredentialStatus;
  content: IExperienceLetter;
  /** Magic-link expiry; `null` when reviewed via authenticated HR inbox (no active token). */
  tokenExpiresAt: string | null;
  hrFeedback: string | null;
}

export interface IssuedCredentialDTO {
  id: string;
  status: CredentialStatus;
  content: IExperienceLetter;
  credentialHash: string;
  signature: string;
  signatoryPubKey: string;
  issuedAt: string;
  companyName: string;
}

export interface VerifyCredentialDTO {
  hash: string;
  valid: boolean;
  revoked?: boolean;
  /** Credential payload was minimized after retention; no personal details returned. */
  purged?: boolean;
  candidateName: string;
  companyName: string;
  joiningDate: string;
  relievingDate: string;
  signer: string;
}
