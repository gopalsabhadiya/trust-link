import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { checkRole } from "../middleware/check-role";
import { requireAuth } from "../middleware/require-auth";
import { DraftRepository } from "../repositories/draft.repository";
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
const candidateController = new CandidateController(draftService);

router.get(
  "/experience",
  requireAuth,
  checkRole(["CANDIDATE"]),
  candidateController.getExperience
);

export { router as candidateRoutes };
