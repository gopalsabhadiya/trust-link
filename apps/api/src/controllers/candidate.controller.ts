import type { NextFunction, Request, Response } from "express";
import type { ApiResponse, CandidateExperienceResponseDTO } from "@trustlink/shared";
import { AppError } from "../middleware";
import { DraftService } from "../services/draft.service";

export class CandidateController {
  constructor(private readonly draftService: DraftService) {}

  getExperience = async (
    req: Request,
    res: Response<ApiResponse<CandidateExperienceResponseDTO>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.authUser) {
        throw new AppError(401, "UNAUTHORIZED", "Not authenticated");
      }
      const data = await this.draftService.getCandidateExperience(req.authUser);
      res.json({ success: true, data, error: null });
    } catch (error) {
      next(error);
    }
  };
}
