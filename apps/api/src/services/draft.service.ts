import {
  ERROR_CODES,
  ExperienceLetterSchema,
  type VerifyCredentialDTO,
  type IssuedCredentialDTO,
  type DraftReviewMutationInput,
  type DraftReviewPublicDTO,
  type ExperienceLetterInput,
  type CandidateExperienceResponseDTO,
  type CandidateExperienceCaseDTO,
  type CandidateExperienceTimelineItemDTO,
  type CaseEditPayloadDTO,
  type RegenerateReviewLinkDTO,
  type CredentialStatus,
  type ExperienceUiStatus,
  compareExperienceCases,
} from "@trustlink/shared";
import { env } from "../config";
import { AppError } from "../middleware";
import type { AuthRequestUser } from "../types/express";
import { DraftRepository } from "../repositories/draft.repository";
import { DraftNotificationService } from "./draft-notification.service";
import { canonicalJSONStringify } from "../utils/canonical-json";
import { generateMagicToken, hashMagicToken, MAGIC_TOKEN_REGEX } from "../utils/magic-token";
import {
  maskHrReviewEmailForDisplay,
  normalizeHrReviewEmail,
} from "../utils/hr-review-email";
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

    const hrReviewEmail = normalizeHrReviewEmail(input.hrEmail);

    const { caseId, version } = await this.drafts.create({
      candidateId: authUser.id,
      companyName: content.companyName,
      content,
      magicTokenHash,
      tokenExpiresAt,
      consentLogged: Boolean(input.consentLogged),
      hrReviewEmail,
    });

    const reviewLink = `${env.FRONTEND_URL}/review/${rawToken}`;
    await this.notifications.sendReviewLink({
      hrEmail: input.hrEmail,
      reviewLink,
      employeeName: content.employeeName,
      companyName: content.companyName,
    });

    return {
      id: caseId,
      status: version.status,
      magicLinkCreated: true,
      tokenExpiresAt: version.tokenExpiresAt!.toISOString(),
    };
  }

  async getReviewByToken(
    token: string,
    authUser: AuthRequestUser
  ): Promise<DraftReviewPublicDTO> {
    const version = await this.resolveActiveVersionFromToken(token);
    this.assertHrCanReviewVersion(version, authUser);
    const parsedContent = ExperienceLetterSchema.parse(version.content);

    const tokenHash = hashMagicToken(token);
    await this.drafts.createComplianceAuditLog({
      versionId: version.id,
      action: "REVIEW_VIEW",
      actorUserId: authUser.id,
      actorMagicTokenHash: tokenHash,
      privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
    });

    return {
      id: version.caseId,
      status: version.status,
      content: parsedContent,
      tokenExpiresAt: version.tokenExpiresAt!.toISOString(),
      hrFeedback: version.hrFeedback,
    };
  }

  async submitReviewAction(
    token: string,
    input: DraftReviewMutationInput,
    authUser: AuthRequestUser
  ) {
    const version = await this.resolveActiveVersionFromToken(token);
    this.assertHrCanReviewVersion(version, authUser);

    if (
      version.status === "REVISIONS_REQUIRED" ||
      version.status === "ISSUED" ||
      version.status === "REJECTED"
    ) {
      return {
        id: version.caseId,
        status: version.status,
        hrFeedback: version.hrFeedback ?? null,
      };
    }

    const tokenHash = hashMagicToken(token);
    const now = new Date();
    await this.drafts.runSoftPurge(now);

    if (input.action === "APPROVE") {
      const parsedContent = ExperienceLetterSchema.parse(version.content);
      const canonicalPayload = canonicalJSONStringify(parsedContent);
      const hash = this.signingService.hashCanonicalPayload(canonicalPayload);
      const signed = this.signingService.signHash(hash);
      const purgeAfterAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const issuedVersion = await this.drafts.issueFromVersion({
        versionId: version.id,
        caseId: version.caseId,
        contentSnapshot: parsedContent,
        credentialHash: signed.hash,
        signature: signed.signature,
        signatoryPubKey: signed.signatoryPubKey,
        privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
        purgeAfterAt,
      });

      await this.drafts.createComplianceAuditLog({
        versionId: version.id,
        action: "CONSENT_TO_ISSUE",
        actorUserId: authUser.id,
        actorMagicTokenHash: tokenHash,
        privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
      });

      return {
        id: version.caseId,
        status: issuedVersion.status,
        hrFeedback: issuedVersion.hrFeedback ?? null,
      };
    }

    const nextStatus = "REVISIONS_REQUIRED";
    const hrFeedback =
      input.action === "REQUEST_REVISION" ? input.hrFeedback?.trim() ?? "" : null;

    const updated = await this.drafts.updateReviewResult(
      version.id,
      nextStatus,
      hrFeedback
    );
    await this.drafts.createComplianceAuditLog({
      versionId: version.id,
      action: "REQUEST_REVISION",
      actorUserId: authUser.id,
      actorMagicTokenHash: tokenHash,
      privacyPolicyVersion: env.PRIVACY_POLICY_VERSION,
      notes: hrFeedback ?? undefined,
    });

    return {
      id: version.caseId,
      status: updated.status,
      hrFeedback: updated.hrFeedback ?? null,
    };
  }

  async getIssuedCredential(id: string, authUser: AuthRequestUser): Promise<IssuedCredentialDTO> {
    const caseRec = await this.drafts.findCaseByIdWithRelations(id);
    if (!caseRec) {
      throw new AppError(404, "NOT_FOUND", "Issued credential not found");
    }
    if (authUser.id !== caseRec.candidateId && authUser.role !== "HR") {
      throw new AppError(403, "FORBIDDEN", "You are not allowed to access this credential");
    }

    const snap = caseRec.snapshots[0];
    if (!snap) {
      throw new AppError(404, "NOT_FOUND", "Issued credential not found");
    }

    if (snap.purgeStatus === "PURGED") {
      throw new AppError(
        404,
        "NOT_FOUND",
        "Issued credential is no longer available (data minimized per retention policy)."
      );
    }

    const content = ExperienceLetterSchema.parse(snap.contentSnapshot);

    return {
      id: caseRec.id,
      status: "ISSUED",
      content,
      credentialHash: snap.credentialHash,
      signature: snap.signature,
      signatoryPubKey: snap.signatoryPubKey,
      issuedAt: snap.issuedAt.toISOString(),
      companyName: caseRec.company.name,
    };
  }

  async verifyCredentialHash(hash: string): Promise<VerifyCredentialDTO> {
    const snap = await this.drafts.findSnapshotByCredentialHash(hash);
    if (!snap) {
      throw new AppError(404, "NOT_FOUND", "Verification record not found");
    }

    const companyName = snap.case.company.name;

    const purgedResponse = (): VerifyCredentialDTO => ({
      hash,
      valid: false,
      purged: true,
      revoked: false,
      candidateName: "",
      companyName: "No longer available",
      joiningDate: "",
      relievingDate: "",
      signer: "No longer available",
    });

    if (snap.purgeStatus === "PURGED") {
      return purgedResponse();
    }

    let content: ExperienceLetterInput;
    try {
      content = ExperienceLetterSchema.parse(snap.contentSnapshot);
    } catch {
      return purgedResponse();
    }

    if (snap.revokedAt) {
      return {
        hash,
        valid: false,
        revoked: true,
        candidateName: content.employeeName,
        companyName,
        joiningDate: content.joiningDate,
        relievingDate: content.relievingDate,
        signer: companyName,
      };
    }

    const canonicalPayload = canonicalJSONStringify(content);
    const computedHash = this.signingService.hashCanonicalPayload(canonicalPayload);
    const valid =
      computedHash === hash &&
      this.signingService.verifyHashSignature(
        hash,
        snap.signature,
        snap.signatoryPubKey
      );

    return {
      hash,
      valid,
      revoked: false,
      candidateName: content.employeeName,
      companyName,
      joiningDate: content.joiningDate,
      relievingDate: content.relievingDate,
      signer: companyName,
    };
  }

  async getCandidateExperience(
    authUser: AuthRequestUser
  ): Promise<CandidateExperienceResponseDTO> {
    if (authUser.role !== "CANDIDATE") {
      throw new AppError(403, "FORBIDDEN", "Only candidates can view experience");
    }

    const rows = await this.drafts.listCasesForCandidate(authUser.id);
    const bundle: Array<{
      c: CandidateExperienceCaseDTO;
      t: CandidateExperienceTimelineItemDTO;
    }> = [];

    let verifiedCredentialCount = 0;
    let pendingCredentialCount = 0;

    for (const row of rows) {
      const v = row.currentVersion;
      if (!v) continue;

      let content: ExperienceLetterInput | null = null;
      try {
        content = ExperienceLetterSchema.parse(v.content);
      } catch {
        content = null;
      }

      const snap = row.snapshots[0];
      const uiStatus = mapPrismaStatusToUiStatus(v.status, Boolean(snap));
      const isSnapshotPurged = snap?.purgeStatus === "PURGED";
      const hasValidSignature = Boolean(
        !isSnapshotPurged &&
          snap?.credentialHash &&
          snap?.signature &&
          snap.signature.length > 0
      );

      if (uiStatus === "ISSUED" && hasValidSignature) verifiedCredentialCount += 1;
      else pendingCredentialCount += 1;

      const tokenExpiresAt =
        v.tokenExpiresAt && v.magicTokenHash ? v.tokenExpiresAt.toISOString() : null;
      const canCopyMagicLink =
        uiStatus === "SUBMITTED" || uiStatus === "HR_REVIEWING";

      const caseDto: CandidateExperienceCaseDTO = {
        caseId: row.id,
        companyName: row.company.name,
        prismaStatus: v.status,
        uiStatus,
        hrFeedback: v.hrFeedback,
        reviewedAt: v.reviewedAt?.toISOString() ?? null,
        tokenExpiresAt,
        canCopyMagicLink,
        canEdit: uiStatus === "REVISIONS_REQUIRED" || uiStatus === "REJECTED",
        canViewIssued: uiStatus === "ISSUED" && hasValidSignature,
        canDownloadPdf: uiStatus === "ISSUED" && hasValidSignature,
        credentialHash: snap?.credentialHash ?? null,
        employeeName: content?.employeeName ?? null,
        designation: content?.designation ?? null,
        joiningDate: content?.joiningDate ?? null,
        relievingDate: content?.relievingDate ?? null,
      };

      const employeeName = content?.employeeName ?? "Candidate";
      const tenureLabel =
        content?.joiningDate && content?.relievingDate
          ? `${content.joiningDate} – ${content.relievingDate}`
          : "Tenure pending";

      const timelineRow: CandidateExperienceTimelineItemDTO =
        uiStatus === "ISSUED" && hasValidSignature
          ? {
              caseId: row.id,
              kind: "verified",
              companyName: row.company.name,
              employeeName,
              tenureLabel,
              issuedAt: snap!.issuedAt.toISOString(),
            }
          : {
              caseId: row.id,
              kind: "pending",
              companyName: row.company.name,
              employeeName,
              tenureLabel,
              issuedAt: null,
            };

      bundle.push({ c: caseDto, t: timelineRow });
    }

    bundle.sort((a, b) => compareExperienceCases(a.c, b.c));
    const cases = bundle.map((x) => x.c);
    const timeline = bundle.map((x) => x.t);

    return {
      summary: {
        verifiedCredentialCount,
        pendingCredentialCount,
      },
      cases,
      timeline,
    };
  }

  async getCaseEditPayload(
    caseId: string,
    authUser: AuthRequestUser
  ): Promise<CaseEditPayloadDTO> {
    if (authUser.role !== "CANDIDATE") {
      throw new AppError(403, "FORBIDDEN", "Only candidates can edit drafts");
    }
    const row = await this.drafts.findCaseForCandidate(caseId, authUser.id);
    if (!row?.currentVersion) {
      throw new AppError(404, "NOT_FOUND", "Case not found");
    }
    const st = row.currentVersion.status;
    if (st !== "REVISIONS_REQUIRED" && st !== "REJECTED") {
      throw new AppError(400, "VALIDATION_ERROR", "This case is not open for editing");
    }
    const content = ExperienceLetterSchema.parse(row.currentVersion.content);
    return {
      caseId: row.id,
      content,
      hrFeedback: row.currentVersion.hrFeedback,
      status: st,
    };
  }

  async resubmitCase(
    caseId: string,
    input: CreateDraftInput,
    authUser: AuthRequestUser
  ) {
    if (authUser.role !== "CANDIDATE") {
      throw new AppError(403, "FORBIDDEN", "Only candidates can resubmit");
    }

    const content = ExperienceLetterSchema.parse(input.content);
    const rawToken = generateMagicToken();
    const magicTokenHash = hashMagicToken(rawToken);
    const tokenExpiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

    const result = await this.drafts.appendResubmitVersion({
      caseId,
      candidateId: authUser.id,
      content,
      magicTokenHash,
      tokenExpiresAt,
      consentLogged: Boolean(input.consentLogged),
      hrReviewEmail: normalizeHrReviewEmail(input.hrEmail),
    });

    if (!result) {
      throw new AppError(400, "VALIDATION_ERROR", "Cannot resubmit this case");
    }

    const reviewLink = `${env.FRONTEND_URL}/review/${rawToken}`;
    await this.notifications.sendReviewLink({
      hrEmail: input.hrEmail,
      reviewLink,
      employeeName: content.employeeName,
      companyName: content.companyName,
    });

    return {
      id: result.caseId,
      status: result.version.status,
      magicLinkCreated: true,
      tokenExpiresAt: result.version.tokenExpiresAt!.toISOString(),
    };
  }

  async regenerateReviewLink(
    caseId: string,
    authUser: AuthRequestUser
  ): Promise<RegenerateReviewLinkDTO> {
    if (authUser.role !== "CANDIDATE") {
      throw new AppError(403, "FORBIDDEN", "Only candidates can refresh review links");
    }

    const row = await this.drafts.findCaseForCandidate(caseId, authUser.id);
    if (!row?.currentVersion) {
      throw new AppError(404, "NOT_FOUND", "Case not found");
    }

    const st = row.currentVersion.status;
    if (st !== "DRAFT_SUBMITTED" && st !== "HR_REVIEWING") {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        "Review link can only be refreshed while HR review is pending"
      );
    }

    const rawToken = generateMagicToken();
    const magicTokenHash = hashMagicToken(rawToken);
    const tokenExpiresAt = new Date(Date.now() + SEVEN_DAYS_MS);

    await this.drafts.updateVersionMagicLink(row.currentVersion.id, magicTokenHash, tokenExpiresAt);

    return {
      reviewUrl: `${env.FRONTEND_URL}/review/${rawToken}`,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
    };
  }

  private async resolveActiveVersionFromToken(token: string) {
    if (!MAGIC_TOKEN_REGEX.test(token)) {
      throw new AppError(404, "NOT_FOUND", "Review link is invalid or expired");
    }

    const hash = hashMagicToken(token);
    const version = await this.drafts.findVersionByTokenHash(hash);
    if (
      !version ||
      !version.tokenExpiresAt ||
      version.tokenExpiresAt.getTime() < Date.now()
    ) {
      throw new AppError(404, "NOT_FOUND", "Review link is invalid or expired");
    }

    return version;
  }

  private assertHrCanReviewVersion(
    version: { hrReviewEmail: string | null },
    authUser: AuthRequestUser
  ): void {
    if (!version.hrReviewEmail) {
      throw new AppError(
        403,
        ERROR_CODES.LEGACY_REVIEW_INVITATION,
        "This review invitation must be reissued by the candidate. Ask them to resubmit or send a fresh HR link."
      );
    }
    const expected = version.hrReviewEmail;
    const actual = normalizeHrReviewEmail(authUser.email);
    if (actual !== expected) {
      const masked = maskHrReviewEmailForDisplay(expected);
      throw new AppError(
        403,
        ERROR_CODES.REVIEW_EMAIL_MISMATCH,
        `This review is restricted to ${masked}. Sign in with the TrustLink account that uses that email.`,
        { invitedEmailMasked: masked }
      );
    }
  }
}

function mapPrismaStatusToUiStatus(
  status: CredentialStatus,
  hasActiveSnapshot: boolean
): ExperienceUiStatus {
  if (status === "ISSUED" && hasActiveSnapshot) return "ISSUED";
  if (status === "ISSUED" && !hasActiveSnapshot) return "SUBMITTED";
  if (status === "REVISIONS_REQUIRED") return "REVISIONS_REQUIRED";
  if (status === "REJECTED") return "REJECTED";
  if (status === "DRAFT_SUBMITTED") return "SUBMITTED";
  if (status === "HR_REVIEWING") return "HR_REVIEWING";
  if (status === "HR_APPROVED") return "HR_REVIEWING";
  return "SUBMITTED";
}
