import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

// Resolve apps/api/.env whether the process cwd is the repo root or apps/api
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const EnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_PORT: z.coerce.number().default(4000),
  API_HOST: z.string().default("0.0.0.0"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  /** Public origin of this API (no trailing slash) — used for OAuth callback URLs */
  API_PUBLIC_URL: z.string().url().default("http://localhost:4000"),
  /** Frontend origin for CORS + post-OAuth redirect */
  WEB_ORIGIN: z.string().url().default("http://localhost:3000"),
  /** Frontend base used for public magic review links */
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  VERIFY_BASE_URL: z.string().url().default("http://localhost:3000"),
  ISSUANCE_PRIVATE_KEY_PEM: z
    .string()
    .min(1, "ISSUANCE_PRIVATE_KEY_PEM is required for credential signing"),
  PRIVACY_POLICY_VERSION: z.string().default("DPDP-2026-v1"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES_DAYS: z.coerce.number().default(7),
  COOKIE_NAME: z.string().default("tl_auth"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID: z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten());
  process.exit(1);
}

export const env = parsed.data;

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);
}

export function isLinkedInOAuthConfigured(): boolean {
  return Boolean(env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET);
}
