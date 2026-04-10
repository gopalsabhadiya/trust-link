import rateLimit from "express-rate-limit";

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
