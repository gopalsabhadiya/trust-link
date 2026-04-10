import type { CredentialDraft, CredentialStatus, Prisma } from "@prisma/client";
import { prisma } from "../config";

export interface CreateDraftInput {
  candidateId: string;
  companyName: string;
  content: Prisma.InputJsonValue;
  magicTokenHash: string;
  tokenExpiresAt: Date;
  consentLogged: boolean;
}

export class DraftRepository {
  async create(input: CreateDraftInput): Promise<CredentialDraft> {
    const existingCompany = await prisma.company.findFirst({
      where: { name: input.companyName },
      select: { id: true },
    });

    const companyId =
      existingCompany?.id ??
      (
        await prisma.company.create({
          data: { name: input.companyName },
          select: { id: true },
        })
      ).id;

    return prisma.credentialDraft.create({
      data: {
        candidateId: input.candidateId,
        companyId,
        content: input.content,
        status: "DRAFT_SUBMITTED",
        magicTokenHash: input.magicTokenHash,
        tokenExpiresAt: input.tokenExpiresAt,
        consentLogged: input.consentLogged,
      },
    });
  }

  findByTokenHash(magicTokenHash: string): Promise<CredentialDraft | null> {
    return prisma.credentialDraft.findUnique({ where: { magicTokenHash } });
  }

  findByIdWithCompanyAndCandidate(id: string) {
    return prisma.credentialDraft.findUnique({
      where: { id },
      include: { company: true, candidate: true },
    });
  }

  findByCredentialHash(hash: string) {
    return prisma.credentialDraft.findUnique({
      where: { credentialHash: hash },
      include: { company: true, candidate: true },
    });
  }

  updateReviewResult(
    id: string,
    status: CredentialStatus,
    hrFeedback: string | null
  ): Promise<CredentialDraft> {
    return prisma.credentialDraft.update({
      where: { id },
      data: {
        status,
        hrFeedback,
        reviewedAt: new Date(),
      },
    });
  }

  issueDraft(input: {
    id: string;
    credentialHash: string;
    signature: string;
    signatoryPubKey: string;
    privacyPolicyVersion: string;
    purgeAfterAt: Date;
  }): Promise<CredentialDraft> {
    return prisma.credentialDraft.update({
      where: { id: input.id },
      data: {
        status: "ISSUED",
        credentialHash: input.credentialHash,
        signature: input.signature,
        signatoryPubKey: input.signatoryPubKey,
        issuedAt: new Date(),
        privacyPolicyVersion: input.privacyPolicyVersion,
        purgeAfterAt: input.purgeAfterAt,
        purgeStatus: "SCHEDULED",
      },
    });
  }

  async createComplianceAuditLog(input: {
    draftId: string;
    action: string;
    actorUserId?: string;
    actorMagicTokenHash?: string;
    privacyPolicyVersion: string;
    notes?: string;
  }): Promise<void> {
    await prisma.complianceAuditLog.create({
      data: {
        draftId: input.draftId,
        action: input.action,
        actorUserId: input.actorUserId,
        actorMagicTokenHash: input.actorMagicTokenHash,
        privacyPolicyVersion: input.privacyPolicyVersion,
        notes: input.notes,
      },
    });
  }

  async runSoftPurge(now: Date): Promise<number> {
    const result = await prisma.credentialDraft.updateMany({
      where: {
        purgeStatus: "SCHEDULED",
        purgeAfterAt: { lte: now },
      },
      data: {
        content: {},
        purgedAt: now,
        purgeStatus: "PURGED",
      },
    });
    return result.count;
  }
}
