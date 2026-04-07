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
