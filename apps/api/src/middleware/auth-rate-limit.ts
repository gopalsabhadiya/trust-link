import rateLimit from "express-rate-limit";
import type { Request } from "express";

export const authRegisterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many registration attempts" },
});

export const authLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many login attempts" },
});

export const draftCreateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, data: null, error: "Too many draft submissions" },
});

export const draftReviewReadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const r = req as Request;
    const uid = r.authUser?.id ?? r.ip ?? "anon";
    return `${uid}:${String(r.params.token ?? "")}`;
  },
  message: { success: false, data: null, error: "Too many review requests" },
});

export const draftReviewWriteLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const r = req as Request;
    const uid = r.authUser?.id ?? r.ip ?? "anon";
    return `${uid}:${String(r.params.token ?? "")}`;
  },
  message: { success: false, data: null, error: "Too many review actions" },
});
