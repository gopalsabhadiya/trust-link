import {
  ExperienceLetterSchema,
  type ExperienceLetterInput,
} from "@trustlink/shared";
import { canonicalJSONStringify } from "./canonical-json";

/** New issuances wrap the letter so each draft version gets a unique credential hash. */
export type IssuedCredentialSnapshotEnvelope = {
  letter: ExperienceLetterInput;
  trustlinkIssuance: { draftVersionId: string; caseId: string };
};

export function buildIssuanceSnapshotEnvelope(
  letter: ExperienceLetterInput,
  draftVersionId: string,
  caseId: string
): IssuedCredentialSnapshotEnvelope {
  return {
    letter,
    trustlinkIssuance: { draftVersionId, caseId },
  };
}

function isEnvelopeSnapshot(snapshot: unknown): snapshot is IssuedCredentialSnapshotEnvelope {
  if (!snapshot || typeof snapshot !== "object") return false;
  const o = snapshot as Record<string, unknown>;
  if (o.letter === null || typeof o.letter !== "object") return false;
  const ti = o.trustlinkIssuance;
  if (ti === null || typeof ti !== "object") return false;
  const t = ti as Record<string, unknown>;
  return typeof t.draftVersionId === "string" && typeof t.caseId === "string";
}

/** Letter for API responses and UI (supports legacy flat JSON in DB). */
export function parseLetterFromIssuedSnapshot(snapshot: unknown): ExperienceLetterInput {
  if (isEnvelopeSnapshot(snapshot)) {
    return ExperienceLetterSchema.parse(snapshot.letter);
  }
  return ExperienceLetterSchema.parse(snapshot);
}

/** Object that was hashed at issuance time (legacy = flat letter only). */
export function snapshotPayloadForCredentialHash(snapshot: unknown): unknown {
  if (isEnvelopeSnapshot(snapshot)) {
    return snapshot;
  }
  return ExperienceLetterSchema.parse(snapshot);
}

export function canonicalStringForIssuedSnapshotHash(snapshot: unknown): string {
  return canonicalJSONStringify(snapshotPayloadForCredentialHash(snapshot));
}
