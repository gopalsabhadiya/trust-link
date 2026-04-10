/** Prevent open redirects: only same-origin relative paths. */
export function safeInternalCallbackUrl(raw: string | null | undefined): string | null {
  if (raw == null || raw === "") return null;
  const decoded = decodeURIComponent(raw);
  if (!decoded.startsWith("/") || decoded.startsWith("//")) return null;
  return decoded;
}
