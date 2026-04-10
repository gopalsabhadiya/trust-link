import type { NextFunction, Request, Response } from "express";
import { DraftReviewMutationSchema, type ApiResponse } from "@trustlink/shared";
import { AppError } from "../middleware";
import { DraftService } from "../services/draft.service";

export class HrController {
  constructor(private readonly draftService: DraftService) {}

  listRequests = async (
    req: Request,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const data = await this.draftService.listHrRequests(req.authUser);
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };

  getReviewByCaseId = async (
    req: Request<{ caseId: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const data = await this.draftService.getHrReviewByCaseId(req.params.caseId, req.authUser);
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };

  reviewByCaseId = async (
    req: Request<{ caseId: string }>,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const parsed = DraftReviewMutationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          "VALIDATION_ERROR",
          parsed.error.errors.map((e) => e.message).join(", ")
        );
      }
      const data = await this.draftService.submitHrReviewByCaseId(
        req.params.caseId,
        parsed.data,
        req.authUser
      );
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };
}
