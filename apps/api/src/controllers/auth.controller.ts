import type { Request, Response, NextFunction } from "express";
import {
  LoginInputSchema,
  RegisterInputSchema,
  type ApiResponse,
  type UserDTO,
} from "@trustlink/shared";
import passport from "passport";
import { env, isGoogleOAuthConfigured, isLinkedInOAuthConfigured } from "../config";
import type { OAuthProfilePayload } from "../config/passport";
import { AppError } from "../middleware";
import { AuthService } from "../services/auth.service";
import { clearAuthCookie, setAuthCookie } from "../utils/auth-cookie";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (
    req: Request,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = RegisterInputSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }
      const user = await this.authService.registerManual(parsed.data);
      setAuthCookie(res, user.id, user.email);
      res.status(201).json({ success: true, data: user, error: null });
    } catch (e) {
      next(e);
    }
  };

  login = async (
    req: Request,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const parsed = LoginInputSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }
      const { email, password } = parsed.data;
      const user = await this.authService.loginManual(email, password);
      setAuthCookie(res, user.id, user.email);
      res.json({ success: true, data: user, error: null });
    } catch (e) {
      next(e);
    }
  };

  googleStart = (_req: Request, res: Response, next: NextFunction): void => {
    if (!isGoogleOAuthConfigured()) {
      res.status(503).json({
        success: false,
        data: null,
        error: "Google sign-in is not configured",
      });
      return;
    }
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(_req, res, next);
  };

  completeGoogleOAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = req.user as OAuthProfilePayload | undefined;
      if (!profile?.email) {
        res.redirect(`${env.WEB_ORIGIN}/register?error=google`);
        return;
      }
      const dto = await this.authService.signInWithOAuth(profile);
      setAuthCookie(res, dto.id, dto.email);
      res.redirect(`${env.WEB_ORIGIN}/dashboard?oauth=success`);
    } catch (e) {
      next(e);
    }
  };

  me = async (
    req: Request,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const auth = req.authUser;
      if (!auth) {
        res.status(401).json({
          success: false,
          data: null,
          error: "Not authenticated",
        });
        return;
      }
      const profile = await this.authService.getSessionProfile(auth.id);
      if (!profile) {
        res.status(401).json({
          success: false,
          data: null,
          error: "Session invalid",
        });
        return;
      }
      res.json({ success: true, data: profile, error: null });
    } catch (e) {
      next(e);
    }
  };

  meHR = async (
    req: Request,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => this.me(req, res, next);

  meRecruiter = async (
    req: Request,
    res: Response<ApiResponse<UserDTO>>,
    next: NextFunction
  ): Promise<void> => this.me(req, res, next);

  logout = (_req: Request, res: Response<ApiResponse<null>>): void => {
    clearAuthCookie(res);
    res.json({ success: true, data: null, error: null });
  };

  linkedinStart = (_req: Request, res: Response, next: NextFunction): void => {
    if (!isLinkedInOAuthConfigured()) {
      res.status(503).json({
        success: false,
        data: null,
        error: "LinkedIn sign-in is not configured",
      });
      return;
    }
    passport.authenticate("linkedin", { session: false })(_req, res, next);
  };

  completeLinkedInOAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const profile = req.user as OAuthProfilePayload | undefined;
      if (!profile?.email) {
        res.redirect(`${env.WEB_ORIGIN}/register?error=linkedin`);
        return;
      }
      const dto = await this.authService.signInWithOAuth(profile);
      setAuthCookie(res, dto.id, dto.email);
      res.redirect(`${env.WEB_ORIGIN}/dashboard?oauth=success`);
    } catch (e) {
      next(e);
    }
  };
}
