import { Router } from "express";
import { DraftController } from "../controllers/draft.controller";
import {
  draftCreateLimiter,
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
const draftController = new DraftController(draftService);

router.post("/", draftCreateLimiter, requireAuth, draftController.createDraft);
router.get(
  "/review/:token",
  draftReviewReadLimiter,
  draftController.getReviewByToken
);
router.patch(
  "/review/:token",
  draftReviewWriteLimiter,
  draftController.reviewByToken
);
router.get("/issued/:id", requireAuth, draftController.getIssuedById);
router.get("/verify/:hash", draftController.verifyByHash);

router.get(
  "/cases/:caseId/edit-payload",
  requireAuth,
  checkRole(["CANDIDATE"]),
  draftController.getCaseEditPayload
);
router.post(
  "/cases/:caseId/resubmit",
  draftCreateLimiter,
  requireAuth,
  checkRole(["CANDIDATE"]),
  draftController.resubmitCase
);
router.post(
  "/cases/:caseId/regenerate-review-link",
  draftCreateLimiter,
  requireAuth,
  checkRole(["CANDIDATE"]),
  draftController.regenerateReviewLink
);

export { router as draftRoutes };
