/** Normalize for storage and comparison (trim + lowercase). */
export function normalizeHrReviewEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Partially mask local-part for safe client error display. */
export function maskHrReviewEmailForDisplay(email: string): string {
  const n = normalizeHrReviewEmail(email);
  const at = n.indexOf("@");
  if (at < 1) return "***";
  const local = n.slice(0, at);
  const domain = n.slice(at + 1);
  if (!domain) return "***";
  if (local.length <= 1) return `*@${domain}`;
  const stars = "*".repeat(Math.min(local.length - 1, 4));
  return `${local[0]}${stars}@${domain}`;
}
