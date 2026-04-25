import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/auth.middleware';
import { AuthService } from '../services/auth.service';
import { BadRequestError } from '../utils/errors.utils';

export class AuthController {
    static async register(req: Request, res: Response, next: any) {
        try {
            const { email, username, password, firstName, lastName } = req.body;

            if (!email || !username || !password) {
                throw new BadRequestError('Missing required fields', {
                    required: ['email', 'username', 'password'],
                    received: { email, username, password: !!password },
                });
            }

            const user = await AuthService.register(
                email,
                username,
                password,
                firstName,
                lastName
            );

            res.status(201).json(user);
        } catch (error) {
            console.error(error);
            next(error);
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            const ipAddress = req.ip || '';
            const userAgent = req.headers['user-agent']?.toString() || '';

            const user = await AuthService.login(
                email,
                password,
                ipAddress,
                userAgent
            );

            res.json(user);
        } catch (error) {
            res.status(500).json({
                message: 'Error logging in',
                error: (error as Error).message,
            });
        }
    }

    static async logout(req: AuthRequest, res: Response) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');

            await AuthService.logout(token, req.user);

            res.json({ message: 'Logged out successfully' });
        } catch (error) {
            res.status(500).json({
                message: 'Error logging out',
                error: (error as Error).message,
            });
        }
    }

    static async getProfile(req: AuthRequest, res: Response) {
        res.json(req.user);
    }
}
