import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ApiResponse, UserRole } from "@trustlink/shared";
import { HTTP_STATUS } from "@trustlink/shared";

/**
 * Protects a route for specific roles. Must run **after** `requireAuth`.
 */
export function checkRole(allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, res: Response<ApiResponse<null>>, next: NextFunction) => {
    const user = req.authUser;
    if (!user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        data: null,
        error: "Not authenticated",
      });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        data: null,
        error: "You do not have access to this resource",
      });
      return;
    }

    next();
  };
}
