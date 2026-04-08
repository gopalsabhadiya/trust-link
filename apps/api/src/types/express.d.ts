import type { UserRole } from "@trustlink/shared";

export interface AuthRequestUser {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthRequestUser;
    }
  }
}

export {};
