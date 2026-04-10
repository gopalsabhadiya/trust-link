import { Router } from "express";
import { HrController } from "../controllers/hr.controller";
import {
  draftReviewReadLimiter,
  draftReviewWriteLimiter,
} from "../middleware/auth-rate-limit";
import { checkRole } from "../middleware/check-role";
import { DraftRepository } from "../repositories/draft.repository";
import { requireAuth } from "../middleware/require-auth";
import { DraftNotificationService } from "../services/draft-notification.service";
import { DraftService } from "../services/draft.service";
import { SigningService } from "../services/signing.service";

const router = Router();

const draftRepository = new DraftRepository();
const draftNotificationService = new DraftNotificationService();
const signingService = new SigningService();
const draftService = new DraftService(
  draftRepository,
  draftNotificationService,
  signingService
);
const hrController = new HrController(draftService);

router.get("/requests", requireAuth, checkRole(["HR"]), hrController.listRequests);
router.get(
  "/cases/:caseId/review",
  requireAuth,
  checkRole(["HR"]),
  draftReviewReadLimiter,
  hrController.getReviewByCaseId
);
router.patch(
  "/cases/:caseId/review",
  requireAuth,
  checkRole(["HR"]),
  draftReviewWriteLimiter,
  hrController.reviewByCaseId
);

export { router as hrRoutes };
