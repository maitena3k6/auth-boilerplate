import { Response } from 'express';
import { time } from 'node:console';

export class APIResponse<T = any> {
    constructor(
        private data: T,
        private statusCode = 200
    ) {}
    send = (res: Response): Response => {
        return res.status(this.statusCode).json({
            success: true,
            data: this.data,
            timestamp: new Date().toISOString(),
        });
    };
}
