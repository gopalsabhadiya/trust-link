import {
  ExperienceLetterSchema,
  type VerifyCredentialDTO,
  type IssuedCredentialDTO,
  type DraftReviewMutationInput,
  type DraftReviewPublicDTO,
  type ExperienceLetterInput,
} from "@trustlink/shared";
import { env } from "../config";
import { AppError } from "../middleware";
import type { AuthRequestUser } from "../types/express";
import { DraftRepository } from "../repositories/draft.repository";
import { DraftNotificationService } from "./draft-notification.service";
import { canonicalJSONStringify } from "../utils/canonical-json";
import { generateMagicToken, hashMagicToken } from "../utils/magic-token";
import { SigningService } from "./signing.service";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface CreateDraftInput {
  content: ExperienceLetterInput;
  consentLogged: boolean;
  hrEmail: string;
}

export class DraftService {
  constructor(
    private readonly drafts: DraftRepository,
    private readonly notifications: DraftNotificationService,
    private readonly signingService: SigningService
  ) {}

  async createDraft(input: CreateDraftInput, authUser: AuthRequestUser) {
    if (authUser.role !== "CANDIDATE") {
      throw new AppError(403, "FORBIDDEN", "Only candidates can create drafts");
    }

    const content = ExperienceLetterSchema.parse(input.content);
    const rawToken = generateMagicToken();
    const magicTokenHash = hashMagicToken(rawToken);
    const tokenExpiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

    const draft = await this.drafts.create({
      candidateId: authUser.id,
      companyName: content.companyName,
      content,
      magicTokenHash,
      tokenExpiresAt,
      consentLogged: Boolean(input.consentLogged),
    });

    const reviewLink = `${env.FRONTEND_URL}/review/${rawToken}`;
    await this.notifications.sendReviewLink({
      hrEmail: input.hrEmail,
      reviewLink,
      employeeName: content.employeeName,
      companyName: content.companyName,
    });

    return {
      id: draft.id,
      status: draft.status,
      magicLinkCreated: true,
      tokenExpiresAt: draft.tokenExpiresAt.toISOString(),
    };
  }

  async getReviewByToken(token: string): Promise<DraftReviewPublicDTO> {
    const draft = await this.resolveActiveDraftFromToken(token);
    const parsedContent = ExperienceLetterSchema.parse(draft.content);

    return {
      id: draft.id,
      status: draft.status,
      content: parsedContent,
      tokenExpiresAt: draft.tokenExpiresAt.toISOString(),
      hrFeedback: draft.hrFeedback,
    };
  }

  async submitReviewAction(token: string, input: DraftReviewMutationInput) {
    const draft = await this.resolveActiveDraftFromToken(token);

    if (
      draft.status === "REVISIONS_REQUIRED" ||
      draft.status === "ISSUED" ||
      draft.status === "REJECTED"
    ) {
      return {
        id: draft.id,
        status: draft.status,
        hrFeedback: draft.hrFeedback ?? null,
      };
    }

    const tokenHash = hashMagicToken(token);
    const now = new Date();
    await this.drafts.runSoftPurge(now);

    if (input.action === "APPROVE") {
      const parsedContent = ExperienceLetterSchema.parse(draft.content);
      const canonicalPayload = canonicalJSONStringify(parsedContent);
      const hash = this.signingService.hashCanonicalPayload(canonicalPayload);
      const signed = this.signingService.signHash(hash);
      const purgeAfterAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const issued = await this.drafts.issueDraft({
        id: draft.id,
        credentialHash: signed.hash,
        signature: signed.signature,
        signatoryPubKey: signed.signatoryPubKey,
        privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
        purgeAfterAt,
      });

      await this.drafts.createComplianceAuditLog({
        draftId: draft.id,
        action: "CONSENT_TO_ISSUE",
        actorMagicTokenHash: tokenHash,
        privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
      });

      return {
        id: issued.id,
        status: issued.status,
        hrFeedback: issued.hrFeedback ?? null,
      };
    }

    const nextStatus = "REVISIONS_REQUIRED";
    const hrFeedback =
      input.action === "REQUEST_REVISION" ? input.hrFeedback?.trim() ?? "" : null;

    const updated = await this.drafts.updateReviewResult(
      draft.id,
      nextStatus,
      hrFeedback
    );
    await this.drafts.createComplianceAuditLog({
      draftId: draft.id,
      action: "REQUEST_REVISION",
      actorMagicTokenHash: tokenHash,
      privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
      notes: hrFeedback ?? undefined,
    });

    return {
      id: updated.id,
      status: updated.status,
      hrFeedback: updated.hrFeedback ?? null,
    };
  }

  async getIssuedCredential(id: string, authUser: AuthRequestUser): Promise<IssuedCredentialDTO> {
    const draft = await this.drafts.findByIdWithCompanyAndCandidate(id);
    if (!draft || draft.status !== "ISSUED") {
      throw new AppError(404, "NOT_FOUND", "Issued credential not found");
    }
    if (authUser.id !== draft.candidateId && authUser.role !== "HR") {
      throw new AppError(403, "FORBIDDEN", "You are not allowed to access this credential");
    }

    const content = ExperienceLetterSchema.parse(draft.content);
    if (!draft.credentialHash || !draft.signature || !draft.signatoryPubKey || !draft.issuedAt) {
      throw new AppError(500, "INTERNAL_ERROR", "Issued credential record is incomplete");
    }

    return {
      id: draft.id,
      status: draft.status,
      content,
      credentialHash: draft.credentialHash,
      signature: draft.signature,
      signatoryPubKey: draft.signatoryPubKey,
      issuedAt: draft.issuedAt.toISOString(),
      companyName: draft.company.name,
    };
  }

  async verifyCredentialHash(hash: string): Promise<VerifyCredentialDTO> {
    const draft = await this.drafts.findByCredentialHash(hash);
    if (!draft || draft.status !== "ISSUED") {
      throw new AppError(404, "NOT_FOUND", "Verification record not found");
    }

    const content = ExperienceLetterSchema.parse(draft.content);
    const canonicalPayload = canonicalJSONStringify(content);
    const computedHash = this.signingService.hashCanonicalPayload(canonicalPayload);
    const valid =
      computedHash === hash &&
      Boolean(draft.signature) &&
      Boolean(draft.signatoryPubKey) &&
      this.signingService.verifyHashSignature(
        hash,
        draft.signature ?? "",
        draft.signatoryPubKey ?? ""
      );

    return {
      hash,
      valid,
      candidateName: content.employeeName,
      companyName: draft.company.name,
      joiningDate: content.joiningDate,
      relievingDate: content.relievingDate,
      signer: draft.company.name,
    };
  }

  private async resolveActiveDraftFromToken(token: string) {
    if (!/^[a-f0-9]{64}$/i.test(token)) {
      throw new AppError(404, "NOT_FOUND", "Review link is invalid or expired");
    }

    const hash = hashMagicToken(token);
    const draft = await this.drafts.findByTokenHash(hash);
    if (!draft || draft.tokenExpiresAt.getTime() < Date.now()) {
      throw new AppError(404, "NOT_FOUND", "Review link is invalid or expired");
    }

    return draft;
  }
}
