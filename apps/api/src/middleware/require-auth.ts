import type { Request, Response, NextFunction } from "express";
import type { ApiResponse } from "@trustlink/shared";
import { HTTP_STATUS } from "@trustlink/shared";
import { env } from "../config";
import { UserRepository } from "../repositories/user.repository";
import { verifyAuthToken } from "../utils/jwt";

const users = new UserRepository();

export async function requireAuth(
  req: Request,
  res: Response<ApiResponse<null>>,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[env.COOKIE_NAME] as string | undefined;
    if (!token) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        data: null,
        error: "Not authenticated",
      });
      return;
    }

    const payload = verifyAuthToken(token);
    const user = await users.findById(payload.sub);
    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        data: null,
        error: "Session invalid",
      });
      return;
    }

    req.authUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch {
    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      data: null,
      error: "Not authenticated",
    });
  }
}
