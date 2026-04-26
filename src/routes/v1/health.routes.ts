import { Router } from 'express';
import { HealthController } from '../../controllers/health.controller';
import { HealthService } from '../../services/health.service';
import { AppDataSource } from '../../data-source';

const router = Router();

const healthService = new HealthService(AppDataSource);
const healthController = new HealthController(healthService);

router.get('/health', healthController.checkHealth);

export default router;