import { Request, Response, NextFunction } from 'express';
import { APIError } from '../utils/api-error';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            data: err.data,
            timestamp: new Date().toISOString(),

            stack:
                process.env.NODE_ENV === 'development' ? err.stack : undefined,
        });
    }
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
};
