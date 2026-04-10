import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@trustlink/shared";
import { HTTP_STATUS, ERROR_CODES } from "@trustlink/shared";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
    public meta?: { invitedEmailMasked?: string }
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response<ApiResponse<null>>,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      data: null,
      error: err.errors.map((e) => e.message).join(", "),
    });
    return;
  }

  if (err instanceof AppError) {
    const body: ApiResponse<null> = {
      success: false,
      data: null,
      error: err.message,
      errorCode: err.errorCode,
      ...(err.meta ? { meta: err.meta } : {}),
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error("Unhandled error:", err);
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    data: null,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
}
