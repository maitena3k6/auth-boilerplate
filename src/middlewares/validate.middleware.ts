import type { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { APIError } from '@src/utils/api-error';

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validations.map((validation) => validation.run(req)));

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().map((err) => ({
                field: err.type === 'field' ? err.path : err.type,
                message: err.msg,
            }));

            throw APIError.badRequest('Validation failed', formattedErrors);
        }

        next();
    };
};
