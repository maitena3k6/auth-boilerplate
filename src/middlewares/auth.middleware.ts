import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entities/User';
import { AppDataSource } from '../data-source';

export interface AuthRequest extends Request {
    user?: User;
}

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
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRoles = req.user.roles.map((role) => role.name);
        const hasRole = roles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
};
