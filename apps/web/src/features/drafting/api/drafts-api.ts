import axios, { type AxiosError, isAxiosError } from "axios";
import type {
  ApiResponse,
  CandidateExperienceResponseDTO,
  CaseEditPayloadDTO,
  DraftReviewMutationInput,
  DraftReviewPublicDTO,
  ExperienceLetterInput,
  IssuedCredentialDTO,
  RegenerateReviewLinkDTO,
  VerifyCredentialDTO,
} from "@trustlink/shared";

export interface CreateDraftPayload {
  content: ExperienceLetterInput;
  consentLogged: boolean;
  hrEmail: string;
}

export interface CreateDraftResponse {
  id: string;
  status:
    | "DRAFT_SUBMITTED"
    | "HR_REVIEWING"
    | "HR_APPROVED"
    | "REVISIONS_REQUIRED"
    | "ISSUED"
    | "REJECTED";
  magicLinkCreated: boolean;
  tokenExpiresAt: string;
}

export interface DraftApiValidationError {
  message: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  errorCode?: string;
  meta?: { invitedEmailMasked?: string };
}

/** Thrown for draft API failures with optional structured codes (e.g. HR review authorization). */
export class DraftRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errorCode?: string,
    public meta?: { invitedEmailMasked?: string }
  ) {
    super(message);
    this.name = "DraftRequestError";
  }
}

const draftsClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function createCredentialDraft(
  payload: CreateDraftPayload
): Promise<CreateDraftResponse> {
  try {
    const { data } = await draftsClient.post<ApiResponse<CreateDraftResponse>>(
      "/drafts",
      payload
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Failed to submit draft");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Failed to submit draft");
  }
}

export interface ReviewActionResponse {
  id: string;
  status:
    | "DRAFT_SUBMITTED"
    | "HR_REVIEWING"
    | "HR_APPROVED"
    | "REVISIONS_REQUIRED"
    | "ISSUED"
    | "REJECTED";
  hrFeedback: string | null;
}

export async function fetchReviewDraft(token: string): Promise<DraftReviewPublicDTO> {
  try {
    const { data } = await draftsClient.get<ApiResponse<DraftReviewPublicDTO>>(
      `/drafts/review/${token}`
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Review link is invalid");
    return data.data;
  } catch (error) {
    throw draftAxiosToRequestError(error, "Review link is invalid or expired");
  }
}

export async function submitReviewAction(
  token: string,
  payload: DraftReviewMutationInput
): Promise<ReviewActionResponse> {
  try {
    const { data } = await draftsClient.patch<ApiResponse<ReviewActionResponse>>(
      `/drafts/review/${token}`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Review action failed");
    return data.data;
  } catch (error) {
    throw draftAxiosToRequestError(error, "Could not submit review action");
  }
}

export async function fetchIssuedCredential(id: string): Promise<IssuedCredentialDTO> {
  try {
    const { data } = await draftsClient.get<ApiResponse<IssuedCredentialDTO>>(
      `/drafts/issued/${id}`
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Credential not found");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not load issued credential");
  }
}

export async function verifyCredentialHash(hash: string): Promise<VerifyCredentialDTO> {
  try {
    const { data } = await draftsClient.get<ApiResponse<VerifyCredentialDTO>>(
      `/drafts/verify/${hash}`
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Verification failed");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not verify credential");
  }
}

export async function fetchCandidateExperience(): Promise<CandidateExperienceResponseDTO> {
  try {
    const { data } = await draftsClient.get<ApiResponse<CandidateExperienceResponseDTO>>(
      "/candidate/experience"
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Could not load experience");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not load experience");
  }
}

export async function fetchCaseEditPayload(caseId: string): Promise<CaseEditPayloadDTO> {
  try {
    const { data } = await draftsClient.get<ApiResponse<CaseEditPayloadDTO>>(
      `/drafts/cases/${caseId}/edit-payload`
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Could not load draft");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not load draft for editing");
  }
}

export async function resubmitCase(
  caseId: string,
  payload: CreateDraftPayload
): Promise<CreateDraftResponse> {
  try {
    const { data } = await draftsClient.post<ApiResponse<CreateDraftResponse>>(
      `/drafts/cases/${caseId}/resubmit`,
      payload
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Resubmit failed");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not resubmit draft");
  }
}

export async function regenerateReviewLink(caseId: string): Promise<RegenerateReviewLinkDTO> {
  try {
    const { data } = await draftsClient.post<ApiResponse<RegenerateReviewLinkDTO>>(
      `/drafts/cases/${caseId}/regenerate-review-link`
    );
    if (!data.success || !data.data) throw new Error(data.error ?? "Could not regenerate link");
    return data.data;
  } catch (error) {
    throw normalizeDraftError(error, "Could not regenerate review link");
  }
}

function normalizeDraftError(error: unknown, fallback: string): DraftApiValidationError {
  const err = error as AxiosError<{
    error?: string;
    fieldErrors?: Record<string, string>;
    errorCode?: string;
    meta?: { invitedEmailMasked?: string };
  }>;
  return {
    message: err.response?.data?.error ?? err.message ?? fallback,
    fieldErrors: err.response?.data?.fieldErrors,
    status: err.response?.status,
    errorCode: err.response?.data?.errorCode,
    meta: err.response?.data?.meta,
  };
}

function draftAxiosToRequestError(error: unknown, fallback: string): never {
  if (isAxiosError(error)) {
    const body = error.response?.data as ApiResponse<unknown> | undefined;
    throw new DraftRequestError(
      body?.error ?? error.message ?? fallback,
      error.response?.status,
      body?.errorCode,
      body?.meta
    );
  }
  throw error;
}
