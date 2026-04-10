import type { CredentialDraftVersion, CredentialStatus, Prisma } from "@prisma/client";
import { prisma } from "../config";

export interface CreateDraftInput {
  candidateId: string;
  companyName: string;
  content: Prisma.InputJsonValue;
  magicTokenHash: string;
  tokenExpiresAt: Date;
  consentLogged: boolean;
}

export interface CreateDraftResult {
  caseId: string;
  version: CredentialDraftVersion;
}

export class DraftRepository {
  async create(input: CreateDraftInput): Promise<CreateDraftResult> {
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

    return prisma.$transaction(async (tx) => {
      const caseRec = await tx.credentialCase.create({
        data: {
          candidateId: input.candidateId,
          companyId,
        },
      });

      const version = await tx.credentialDraftVersion.create({
        data: {
          caseId: caseRec.id,
          versionNumber: 1,
          content: input.content,
          status: "DRAFT_SUBMITTED",
          magicTokenHash: input.magicTokenHash,
          tokenExpiresAt: input.tokenExpiresAt,
          consentLogged: input.consentLogged,
        },
      });

      await tx.credentialCase.update({
        where: { id: caseRec.id },
        data: { currentVersionId: version.id },
      });

      return { caseId: caseRec.id, version };
    });
  }

  findVersionByTokenHash(magicTokenHash: string) {
    return prisma.credentialDraftVersion.findUnique({
      where: { magicTokenHash },
      include: { case: true },
    });
  }

  findCaseByIdWithRelations(id: string) {
    return prisma.credentialCase.findUnique({
      where: { id },
      include: {
        company: true,
        candidate: true,
        snapshots: {
          where: { revokedAt: null },
          orderBy: { issuedAt: "desc" },
          take: 1,
        },
      },
    });
  }

  findSnapshotByCredentialHash(hash: string) {
    return prisma.issuedCredentialSnapshot.findUnique({
      where: { credentialHash: hash },
      include: {
        case: { include: { company: true } },
        version: true,
      },
    });
  }

  updateReviewResult(
    versionId: string,
    status: CredentialStatus,
    hrFeedback: string | null
  ): Promise<CredentialDraftVersion> {
    return prisma.credentialDraftVersion.update({
      where: { id: versionId },
      data: {
        status,
        hrFeedback,
        reviewedAt: new Date(),
      },
    });
  }

  issueFromVersion(input: {
    versionId: string;
    caseId: string;
    contentSnapshot: Prisma.InputJsonValue;
    credentialHash: string;
    signature: string;
    signatoryPubKey: string;
    privacyPolicyVersion: string;
    purgeAfterAt: Date;
  }): Promise<CredentialDraftVersion> {
    return prisma.$transaction(async (tx) => {
      await tx.issuedCredentialSnapshot.create({
        data: {
          caseId: input.caseId,
          sourceVersionId: input.versionId,
          credentialHash: input.credentialHash,
          signature: input.signature,
          signatoryPubKey: input.signatoryPubKey,
          contentSnapshot: input.contentSnapshot,
          privacyPolicyVersion: input.privacyPolicyVersion,
          purgeAfterAt: input.purgeAfterAt,
          purgeStatus: "SCHEDULED",
        },
      });

      return tx.credentialDraftVersion.update({
        where: { id: input.versionId },
        data: {
          status: "ISSUED",
          magicTokenHash: null,
          tokenExpiresAt: null,
        },
      });
    });
  }

  async createComplianceAuditLog(input: {
    versionId: string;
    action: string;
    actorUserId?: string;
    actorMagicTokenHash?: string;
    privacyPolicyVersion: string;
    notes?: string;
  }): Promise<void> {
    await prisma.complianceAuditLog.create({
      data: {
        versionId: input.versionId,
        action: input.action,
        actorUserId: input.actorUserId,
        actorMagicTokenHash: input.actorMagicTokenHash,
        privacyPolicyVersion: input.privacyPolicyVersion,
        notes: input.notes,
      },
    });
  }

  async runSoftPurge(now: Date): Promise<number> {
    const due = await prisma.issuedCredentialSnapshot.findMany({
      where: {
        purgeStatus: "SCHEDULED",
        purgeAfterAt: { lte: now },
      },
      select: { id: true, sourceVersionId: true },
    });

    if (due.length === 0) return 0;

    const versionIds = due.map((d) => d.sourceVersionId);

    await prisma.$transaction([
      prisma.credentialDraftVersion.updateMany({
        where: { id: { in: versionIds } },
        data: { content: {} },
      }),
      prisma.issuedCredentialSnapshot.updateMany({
        where: { id: { in: due.map((d) => d.id) } },
        data: {
          purgedAt: now,
          purgeStatus: "PURGED",
          contentSnapshot: {},
        },
      }),
    ]);

    return due.length;
  }

  async revokeSnapshotByHash(
    credentialHash: string,
    reason: string
  ): Promise<void> {
    await prisma.issuedCredentialSnapshot.update({
      where: { credentialHash },
      data: {
        revokedAt: new Date(),
        revocationReason: reason,
      },
    });
  }

  listCasesForCandidate(candidateId: string) {
    return prisma.credentialCase.findMany({
      where: { candidateId },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        company: { select: { name: true } },
        currentVersion: true,
        snapshots: {
          where: { revokedAt: null },
          orderBy: { issuedAt: "desc" },
          take: 1,
          select: {
            credentialHash: true,
            signature: true,
            issuedAt: true,
            purgeStatus: true,
          },
        },
      },
    });
  }

  findCaseForCandidate(caseId: string, candidateId: string) {
    return prisma.credentialCase.findFirst({
      where: { id: caseId, candidateId },
      include: { currentVersion: true },
    });
  }

  async appendResubmitVersion(input: {
    caseId: string;
    candidateId: string;
    content: Prisma.InputJsonValue;
    magicTokenHash: string;
    tokenExpiresAt: Date;
    consentLogged: boolean;
  }): Promise<CreateDraftResult | null> {
    return prisma.$transaction(async (tx) => {
      const caseRec = await tx.credentialCase.findFirst({
        where: { id: input.caseId, candidateId: input.candidateId },
        include: { currentVersion: true },
      });
      const st = caseRec?.currentVersion?.status;
      if (
        !caseRec?.currentVersion ||
        (st !== "REVISIONS_REQUIRED" && st !== "REJECTED")
      ) {
        return null;
      }

      const agg = await tx.credentialDraftVersion.aggregate({
        where: { caseId: input.caseId },
        _max: { versionNumber: true },
      });
      const nextNum = (agg._max.versionNumber ?? 0) + 1;

      const version = await tx.credentialDraftVersion.create({
        data: {
          caseId: input.caseId,
          versionNumber: nextNum,
          content: input.content,
          status: "DRAFT_SUBMITTED",
          magicTokenHash: input.magicTokenHash,
          tokenExpiresAt: input.tokenExpiresAt,
          consentLogged: input.consentLogged,
        },
      });

      await tx.credentialCase.update({
        where: { id: input.caseId },
        data: { currentVersionId: version.id },
      });

      return { caseId: caseRec.id, version };
    });
  }

  async updateVersionMagicLink(
    versionId: string,
    magicTokenHash: string,
    tokenExpiresAt: Date
  ): Promise<void> {
    await prisma.credentialDraftVersion.update({
      where: { id: versionId },
      data: { magicTokenHash, tokenExpiresAt },
    });
  }
}
