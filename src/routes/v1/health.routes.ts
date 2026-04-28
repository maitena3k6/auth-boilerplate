import { Router } from 'express';
import { HealthController } from '@src/controllers/health.controller';
import { HealthService } from '@src/services/health.service';
import { AppDataSource } from '@src/data-source';
import { asyncHandler } from '@src/utils/async-handler';

const router = Router();

const healthService = new HealthService(AppDataSource);

const healthController = new HealthController(healthService);

router.get('/', asyncHandler(healthController.checkHealth));

export default router;
