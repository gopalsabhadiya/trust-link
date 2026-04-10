import type { CredentialStatus, IExperienceLetter } from "./credentials";

/** UI-facing status for candidate experience dashboard badges. */
export type ExperienceUiStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "HR_REVIEWING"
  | "REVISIONS_REQUIRED"
  | "ISSUED"
  | "REJECTED";

export interface CandidateExperienceSummaryDTO {
  verifiedCredentialCount: number;
  pendingCredentialCount: number;
}

export interface CandidateExperienceCaseDTO {
  caseId: string;
  companyName: string;
  prismaStatus: CredentialStatus;
  uiStatus: ExperienceUiStatus;
  hrFeedback: string | null;
  reviewedAt: string | null;
  tokenExpiresAt: string | null;
  canCopyMagicLink: boolean;
  canEdit: boolean;
  canViewIssued: boolean;
  canDownloadPdf: boolean;
  credentialHash: string | null;
  /** Minimal preview for list cards */
  employeeName: string | null;
  designation: string | null;
  joiningDate: string | null;
  relievingDate: string | null;
}

export interface CandidateExperienceTimelineItemDTO {
  caseId: string;
  kind: "verified" | "pending";
  companyName: string;
  employeeName: string;
  tenureLabel: string;
  issuedAt: string | null;
}

export interface CandidateExperienceResponseDTO {
  summary: CandidateExperienceSummaryDTO;
  cases: CandidateExperienceCaseDTO[];
  timeline: CandidateExperienceTimelineItemDTO[];
}

export interface CaseEditPayloadDTO {
  caseId: string;
  content: IExperienceLetter;
  hrFeedback: string | null;
  status: CredentialStatus;
}

export interface RegenerateReviewLinkDTO {
  reviewUrl: string;
  tokenExpiresAt: string;
}
