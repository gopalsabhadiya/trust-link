import type { Response } from "express";
import { env } from "../config";
import { signAuthToken } from "./jwt";

export function setAuthCookie(res: Response, userId: string, email: string): void {
  const token = signAuthToken(userId, email);
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: env.JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.COOKIE_NAME, { path: "/" });
}
