import type { User as PrismaUser } from "@prisma/client";
import type { RegisterInput, UserDTO } from "@trustlink/shared";
import { RegisterInputSchema } from "@trustlink/shared";
import { AppError } from "../middleware/error-handler";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword, verifyPassword } from "./password.service";

function toUserDTO(user: PrismaUser): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    authProvider: user.authProvider,
    consentGiven: user.consentGiven,
    consentTimestamp: user.consentTimestamp,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export interface OAuthSignInInput {
  authProvider: "GOOGLE" | "LINKEDIN";
  externalId: string;
  email: string;
  name: string;
}

export class AuthService {
  constructor(private readonly users: UserRepository) {}

  parseRegisterInput(body: unknown): RegisterInput {
    const parsed = RegisterInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new AppError(
        400,
        "VALIDATION_ERROR",
        parsed.error.errors.map((e) => e.message).join(", ")
      );
    }
    return parsed.data;
  }

  async registerManual(body: unknown): Promise<UserDTO> {
    const input = this.parseRegisterInput(body);
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new AppError(
        409,
        "CONFLICT",
        "An account with this email already exists"
      );
    }

    const passwordHash = await hashPassword(input.password);
    const now = new Date();

    const user = await this.users.createManual({
      email: input.email,
      name: input.fullName.trim(),
      role: input.role,
      passwordHash,
      consentGiven: true,
      consentTimestamp: now,
    });

    return toUserDTO(user);
  }

  async loginManual(email: string, password: string): Promise<UserDTO> {
    const user = await this.users.findByEmail(email);
    if (!user || user.authProvider !== "MANUAL" || !user.passwordHash) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password");
    }
    return toUserDTO(user);
  }

  async signInWithOAuth(input: OAuthSignInInput): Promise<UserDTO> {
    const provider = input.authProvider === "GOOGLE" ? "GOOGLE" : "LINKEDIN";

    const linked = await this.users.findByProviderAndExternalId(
      provider,
      input.externalId
    );
    if (linked) {
      return toUserDTO(linked);
    }

    const byEmail = await this.users.findByEmail(input.email);
    if (byEmail) {
      throw new AppError(
        409,
        "CONFLICT",
        "An account with this email already exists. Sign in with your original method."
      );
    }

    const now = new Date();
    const user = await this.users.createOAuth({
      email: input.email,
      name: input.name,
      role: "CANDIDATE",
      authProvider: provider,
      externalId: input.externalId,
      consentGiven: true,
      consentTimestamp: now,
    });

    return toUserDTO(user);
  }
}
