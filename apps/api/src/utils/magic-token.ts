import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;

/** Hex-encoded token length (2 chars per byte). */
export const MAGIC_TOKEN_HEX_LENGTH = TOKEN_BYTES * 2;

/** Validates raw magic link token shape; updates automatically if `TOKEN_BYTES` changes. */
export const MAGIC_TOKEN_REGEX = new RegExp(`^[a-f0-9]{${MAGIC_TOKEN_HEX_LENGTH}}$`, "i");

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
