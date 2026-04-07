export type UserRole = "HR" | "CANDIDATE" | "RECRUITER";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
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
