import type { Response } from 'express';
import { APIResponse } from '@src/utils/api-response';
import { APIError } from '@src/utils/api-error';
import type { AuthRequest, TypedRequest } from '@src/utils/typed-request';
import { UserService } from '@src/services/user.service';
import { UpdateProfileDto } from '@src/dtos/users.dto';

export class UserController {
    constructor(private userService: UserService) {}

    getProfile = async (req: AuthRequest, res: Response) => {
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
    };

    getUserById = async (req: AuthRequest, res: Response) => {
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
    };

    getUserByEmail = async (req: AuthRequest, res: Response) => {
        const email = req.params.email as string;
        console.log(req.params);

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
    };

    getAllUsers = async (req: AuthRequest, res: Response) => {
        const { count, offset } = req.query;
        const users = await this.userService.getAll(
            count ? parseInt(count as string, 10) : undefined,
            offset ? parseInt(offset as string, 10) : undefined
        );
        new APIResponse(users).send(res);
    };

    updateProfile = async (
        req: TypedRequest<UpdateProfileDto>,
        res: Response
    ) => {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        const { firstName, lastName, email, avatar, roleNames } = req.body;

        const updatedUser = await this.userService.update({
            id: user.id,
            firstName,
            lastName,
            email,
            avatar,
            roleNames,
        });

        if (!updatedUser) {
            throw APIError.notFound('User not found');
        }

        new APIResponse({
            id: updatedUser.id,
            email: updatedUser.email,
            username: updatedUser.username,
            avatar: updatedUser.avatar,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            roles: updatedUser.roles.map((role) => role.name),
        }).send(res);
    };

    disableProfile = async (req: AuthRequest, res: Response) => {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        await this.userService.disable(user.id);

        new APIResponse({ message: 'Profile disabled successfully' }).send(res);
    };
}
