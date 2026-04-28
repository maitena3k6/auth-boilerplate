import type { Request, Response } from 'express';
import { HealthService } from '@src/services/health.service';
import { APIResponse } from '@src/utils/api-response';

export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    checkHealth = async (req: Request, res: Response) => {
        const healthStatus = await this.healthService.checkHealth();

        new APIResponse(healthStatus).send(res);
    }
}
