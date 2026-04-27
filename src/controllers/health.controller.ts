import type { Request, Response } from 'express';
import { HealthService } from '../services/health.service';
import { APIResponse } from 'express-api-utils';

export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    checkHealth = async (req: Request, res: Response) => {
        const healthStatus = await this.healthService.checkHealth();

        new APIResponse(healthStatus).send(res);
    }
}
