export { DEFAULT_PRIVACY_POLICY_VERSION } from "./privacy";

export const USER_ROLES = ["HR", "CANDIDATE", "RECRUITER"] as const;

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  CREDENTIAL_REVOKED: "CREDENTIAL_REVOKED",
  CREDENTIAL_EXPIRED: "CREDENTIAL_EXPIRED",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  /** Logged-in HR email does not match the invited reviewer on this draft. */
  REVIEW_EMAIL_MISMATCH: "REVIEW_EMAIL_MISMATCH",
  /** Draft predates stored reviewer email; candidate must resubmit or regenerate link. */
  LEGACY_REVIEW_INVITATION: "LEGACY_REVIEW_INVITATION",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/** Socket.io event name — HR inbox real-time updates. */
export const HR_SOCKET_EVENT_NEW_CREDENTIAL_REQUEST = "NEW_CREDENTIAL_REQUEST" as const;

export interface HrNewCredentialRequestPayload {
  candidateName: string;
  caseId: string;
  companyName: string;
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
