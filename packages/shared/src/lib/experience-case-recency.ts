import type { ExperienceUiStatus } from "../types/experience";

/** Minimal case shape for recency ordering (client + server). */
export interface ExperienceCaseRecencyInput {
  uiStatus: ExperienceUiStatus;
  reviewedAt: string | null;
  tokenExpiresAt: string | null;
  joiningDate: string | null;
  relievingDate: string | null;
}

export function caseActivityTimestamp(c: ExperienceCaseRecencyInput): number {
  if (c.uiStatus === "ISSUED") {
    const end = c.relievingDate || c.joiningDate;
    if (end) return new Date(end).getTime();
    return 0;
  }
  if (c.reviewedAt) return new Date(c.reviewedAt).getTime();
  if (c.tokenExpiresAt) return new Date(c.tokenExpiresAt).getTime();
  if (c.joiningDate) return new Date(c.joiningDate).getTime();
  return 0;
}

function doneRank(uiStatus: ExperienceUiStatus): number {
  return uiStatus === "ISSUED" ? 1 : 0;
}

/** Newest activity first; ties favor in-progress over issued. */
export function compareExperienceCases(
  a: ExperienceCaseRecencyInput,
  b: ExperienceCaseRecencyInput
): number {
  const tb = caseActivityTimestamp(b);
  const ta = caseActivityTimestamp(a);
  if (tb !== ta) return tb - ta;
  return doneRank(a.uiStatus) - doneRank(b.uiStatus);
}
