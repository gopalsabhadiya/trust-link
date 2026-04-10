import type { NextFunction, Request, Response } from "express";
import {
  DraftReviewMutationSchema,
  ExperienceLetterSchema,
  type ApiResponse,
} from "@trustlink/shared";
import { z } from "zod";
import { AppError } from "../middleware";
import { DraftService } from "../services/draft.service";

const CreateDraftRequestSchema = z
  .object({
    content: ExperienceLetterSchema,
    consentLogged: z
      .boolean()
      .refine((v) => v === true, { message: "DPDP consent must be confirmed before submitting" }),
    hrEmail: z
      .string()
      .trim()
      .email("Invalid HR email address")
      .transform((s) => s.trim().toLowerCase()),
  })
  .strict();

export class DraftController {
  constructor(private readonly draftService: DraftService) {}

  createDraft = async (
    req: Request,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }

      const parsed = CreateDraftRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }

      const result = await this.draftService.createDraft(parsed.data, req.authUser);
      res.status(201).json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  getReviewByToken = async (
    req: Request<{ token: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      const result = await this.draftService.getReviewByToken(
        req.params.token,
        req.authUser
      );
      res.json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  reviewByToken = async (
    req: Request<{ token: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      res.setHeader("X-Robots-Tag", "noindex, nofollow");
      const parsed = DraftReviewMutationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }

      const result = await this.draftService.submitReviewAction(
        req.params.token,
        parsed.data,
        req.authUser
      );
      res.json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  getIssuedById = async (
    req: Request<{ id: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const result = await this.draftService.getIssuedCredential(req.params.id, req.authUser);
      res.json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  verifyByHash = async (
    req: Request<{ hash: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.draftService.verifyCredentialHash(req.params.hash);
      res.json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  getCaseEditPayload = async (
    req: Request<{ caseId: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const data = await this.draftService.getCaseEditPayload(req.params.caseId, req.authUser);
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };

  resubmitCase = async (
    req: Request<{ caseId: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const parsed = CreateDraftRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }
      const result = await this.draftService.resubmitCase(
        req.params.caseId,
        parsed.data,
        req.authUser
      );
      res.status(201).json({ success: true, data: result, error: null });
    } catch (error) {
      next(error);
    }
  };

  regenerateReviewLink = async (
    req: Request<{ caseId: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const data = await this.draftService.regenerateReviewLink(req.params.caseId, req.authUser);
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };
}
