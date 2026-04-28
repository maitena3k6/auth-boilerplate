import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@src/utils/typed-request';
import jwt from 'jsonwebtoken';
import { APIError } from '@src/utils/api-error';
import { User } from '@src/entities/User';
import { AppDataSource } from '@src/data-source';

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'secret'
        ) as any;
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { id: decoded.id },
            relations: ['roles'],
        });

        if (!user || !user.isActive) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        throw APIError.unauthorized('Invalid token');
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw APIError.unauthorized('Unauthorized');
        }

        const userRoles = req.user.roles.map((role) => role.name);
        const hasRole = roles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            throw APIError.forbidden('Forbidden');
        }

        next();
    };
};
