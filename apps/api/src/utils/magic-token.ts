import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;

export function generateMagicToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashMagicToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeCompareTokenHashes(
  hashA: string,
  hashB: string
): boolean {
  const a = Buffer.from(hashA, "hex");
  const b = Buffer.from(hashB, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
