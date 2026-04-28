import type { Response } from 'express';
import type { LoginDto, RefreshTokenDto, RegisterDto } from '@src/dtos/auth.dto';
import type { AuthRequest, TypedRequest } from '@src/types/typed-request';
import { AuthService } from '@src/services/auth.service';
import { APIResponse } from '@src/utils/api-response';

export class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (req: TypedRequest<LoginDto>, res: Response) => {
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
    };

    register = async (req: TypedRequest<RegisterDto>, res: Response) => {
        const {
            email,
            username,
            password,
            firstName = '',
            lastName = '',
        } = req.body;

        const user = await this.authService.register(
            email,
            username,
            password,
            firstName,
            lastName
        );

        new APIResponse(user, 201).send(res);
    };

    refreshToken = async (
        req: TypedRequest<RefreshTokenDto>,
        res: Response
    ) => {
        const { refreshToken } = req.body;

        const newToken = await this.authService.refreshToken(refreshToken);

        new APIResponse(newToken).send(res);
    };

    logout = async (req: AuthRequest, res: Response) => {
        const token = req.headers.authorization?.replace('Bearer ', '');

        const loggedOut = await this.authService.logout(token, req.user);

        new APIResponse(loggedOut).send(res);
    };
}
