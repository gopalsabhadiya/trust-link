export interface IExperienceLetter {
  employeeName: string;
  designation: string;
  joiningDate: string;
  relievingDate: string;
  keyAchievements: string[];
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
  tokenExpiresAt: string;
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
  candidateName: string;
  companyName: string;
  joiningDate: string;
  relievingDate: string;
  signer: string;
}
