import { Router } from "express";
import passport from "passport";
import { env } from "../config";
import { AuthController } from "../controllers/auth.controller";
import { authLoginLimiter, authRegisterLimiter } from "../middleware/auth-rate-limit";
import { checkRole, requireAuth } from "../middleware";
import { UserRepository } from "../repositories/user.repository";
import { AuthService } from "../services/auth.service";

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const router = Router();

router.post("/register", authRegisterLimiter, authController.register);
router.post("/login", authLoginLimiter, authController.login);
router.post("/logout", authController.logout);
router.get("/me", requireAuth, authController.me);

// Example RBAC-protected endpoints for role-specific dashboard data.
router.get("/me/hr", requireAuth, checkRole(["HR"]), authController.meHR);
router.get(
  "/me/recruiter",
  requireAuth,
  checkRole(["RECRUITER", "HR"]),
  authController.meRecruiter
);

router.get("/google", authController.googleStart);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${env.WEB_ORIGIN}/register?error=google`,
  }),
  authController.completeGoogleOAuth
);

router.get("/linkedin", authController.linkedinStart);
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    session: false,
    failureRedirect: `${env.WEB_ORIGIN}/register?error=linkedin`,
  }),
  authController.completeLinkedInOAuth
);

export { router as authRoutes };
