import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { candidateRoutes } from "./candidate.routes";
import { draftRoutes } from "./draft.routes";
import { healthRoutes } from "./health.routes";

const router = Router();

router.use(healthRoutes);
router.use("/auth", authRoutes);
router.use("/candidate", candidateRoutes);
router.use("/drafts", draftRoutes);

export { router as apiRouter };
