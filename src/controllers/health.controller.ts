import type { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service';
import { APIResponse } from 'express-api-utils';

export class HealthController {
    constructor(private readonly healthService: HealthService) {}

    async checkHealth(req: Request, res: Response, next: NextFunction) {
        const healthStatus = await this.healthService.checkHealth();
        
        new APIResponse(healthStatus).send(res);
    }
}
