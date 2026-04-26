import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../dto/api-request.dto';
import { APIError, APIResponse } from 'express-api-utils';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    async register(req: Request, res: Response) {
        const { email, username, password, firstName, lastName } = req.body;

        if (!email || !username || !password) {
            throw APIError.badRequest(
                'Email, username, and password are required'
            );
        }

        const user = await this.authService.register(
            email,
            username,
            password,
            firstName,
            lastName
        );

        new APIResponse(user, 201).send(res);
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;
        const ipAddress = req.ip || '';
        const userAgent = req.headers['user-agent']?.toString() || '';

        const user = await this.authService.login(
            email,
            password,
            ipAddress,
            userAgent
        );

        new APIResponse(user).send(res);
    }

    async logout(req: AuthRequest, res: Response) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        const loggedOut = await this.authService.logout(token, req.user);

        new APIResponse(loggedOut).send(res);
    }

    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw APIError.badRequest('Refresh token is required');
        }

        const newToken = await this.authService.refreshToken(refreshToken);

        new APIResponse(newToken).send(res);
    }
}
