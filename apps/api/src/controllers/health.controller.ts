import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@trustlink/shared";
import type { IHealthService } from "../services";

export class HealthController {
  constructor(private readonly healthService: IHealthService) {}

  getHealth = async (
    _req: Request,
    res: Response<ApiResponse<unknown>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const status = await this.healthService.getHealthStatus();
      res.json({
        success: true,
        data: status,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  };
}
