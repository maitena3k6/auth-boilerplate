import type { Response } from 'express';
import type { AuthRequest } from '../dto/api-request.dto';
import { UserService } from '../services/user.service';
import { APIError, APIResponse } from 'express-api-utils';

export class UserController {
    constructor(private userService: UserService) {}

    async getProfile(req: AuthRequest, res: Response) {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        new APIResponse({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles.map((role) => role.name),
            avatar: user.avatar,
        }).send(res);
    }

    async getUserById(req: AuthRequest, res: Response) {
        const { id } = req.params;
        const user = await this.userService.getById(id as string);
        if (!user) {
            throw APIError.notFound('User not found');
        }

        new APIResponse({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles.map((role) => role.name),
            avatar: user.avatar,
        }).send(res);
    }

    async getUserByEmail(req: AuthRequest, res: Response) {
        const { email } = req.query;
        if (!email || typeof email !== 'string') {
            throw APIError.badRequest('Email query parameter is required');
        }

        const user = await this.userService.getByEmail(email);
        if (!user) {
            throw APIError.notFound('User not found');
        }

        new APIResponse({
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles.map((role) => role.name),
            avatar: user.avatar,
        }).send(res);
    }

    async getAllUsers(req: AuthRequest, res: Response) {
        const { count, offset } = req.query;
        const users = await this.userService.getAll(
            count ? parseInt(count as string, 10) : undefined,
            offset ? parseInt(offset as string, 10) : undefined
        );
        new APIResponse(users).send(res);
    }

    async updateProfile(req: AuthRequest, res: Response) {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        const { firstName, lastName, email, password, avatar } = req.body;

        const updatedUser = await this.userService.update(
            user.id,
            firstName,
            lastName,
            email,
            password,
            undefined,
            avatar
        );

        if (!updatedUser) {
            throw APIError.notFound('User not found');
        }

        new APIResponse({
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            roles: updatedUser.roles.map((role) => role.name),
            avatar: updatedUser.avatar,
        }).send(res);
    }

    async disableProfile(req: AuthRequest, res: Response) {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        await this.userService.disable(user.id);

        new APIResponse({ message: 'Profile disabled successfully' }).send(res);
    }
}
