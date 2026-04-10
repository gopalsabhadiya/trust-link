import type { AuthProvider, User, UserRole } from "@prisma/client";
import { prisma } from "../config";

export interface CreateManualUserInput {
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  consentPolicyVersion: string;
}

export interface CreateOAuthUserInput {
  email: string;
  name: string;
  role: UserRole;
  authProvider: AuthProvider;
  externalId: string;
  consentGiven: boolean;
  consentTimestamp: Date;
  consentPolicyVersion: string;
}

export class UserRepository {
  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  findByProviderAndExternalId(
    authProvider: AuthProvider,
    externalId: string
  ): Promise<User | null> {
    return prisma.user.findFirst({
      where: { authProvider, externalId },
    });
  }

  createManual(data: CreateManualUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        passwordHash: data.passwordHash,
        authProvider: "MANUAL",
        consentGiven: data.consentGiven,
        consentTimestamp: data.consentTimestamp,
        consentPolicyVersion: data.consentPolicyVersion,
      },
    });
  }

  createOAuth(data: CreateOAuthUserInput): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        name: data.name,
        role: data.role,
        authProvider: data.authProvider,
        externalId: data.externalId,
        passwordHash: null,
        consentGiven: data.consentGiven,
        consentTimestamp: data.consentTimestamp,
        consentPolicyVersion: data.consentPolicyVersion,
      },
    });
  }
}
