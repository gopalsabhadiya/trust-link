import jwt from "jsonwebtoken";
import { env } from "../config";

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signAuthToken(userId: string, email: string): string {
  const payload: JwtPayload = { sub: userId, email };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: `${env.JWT_EXPIRES_DAYS}d`,
  });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
