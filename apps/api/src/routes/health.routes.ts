import { Router } from "express";
import { HealthController } from "../controllers";
import { HealthService } from "../services";
import { HealthRepository } from "../repositories";

const router = Router();

const healthRepository = new HealthRepository();
const healthService = new HealthService(healthRepository);
const healthController = new HealthController(healthService);

router.get("/health", healthController.getHealth);

export { router as healthRoutes };
