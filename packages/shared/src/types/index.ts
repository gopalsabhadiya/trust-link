export type UserRole = "HR" | "CANDIDATE" | "RECRUITER";

export type AuthProvider = "MANUAL" | "GOOGLE" | "LINKEDIN";

export interface ApiResponse<T> {
  success: boolean;
  /** Present when `success` is true; otherwise typically `null`. */
  data: T | null;
  error: string | null;
}

/** Full user shape (includes sensitive fields only on server / never in API responses). */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  /** Public avatar URL when set (OAuth or uploaded). */
  profilePicture: string | null;
  /** Unread in-app notifications (server-computed; 0 when none). */
  notificationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Safe user payload returned by the API (no passwordHash). */
export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  consentGiven: boolean;
  consentTimestamp: Date | null;
  profilePicture: string | null;
  notificationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerifiableCredential {
  id: string;
  issuerId: string;
  holderId: string;
  type: string;
  claims: Record<string, unknown>;
  issuedAt: Date;
  expiresAt: Date | null;
  revoked: boolean;
}

export interface VerificationRequest {
  id: string;
  verifierId: string;
  holderId: string;
  credentialId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: Date;
  resolvedAt: Date | null;
}

export type {
  IExperienceLetter,
  CredentialStatus,
  DraftReviewAction,
  DraftReviewPublicDTO,
  IssuedCredentialDTO,
  VerifyCredentialDTO,
} from "./credentials";

export type {
  ExperienceUiStatus,
  CandidateExperienceSummaryDTO,
  CandidateExperienceCaseDTO,
  CandidateExperienceTimelineItemDTO,
  CandidateExperienceResponseDTO,
  CaseEditPayloadDTO,
  RegenerateReviewLinkDTO,
} from "./experience";
