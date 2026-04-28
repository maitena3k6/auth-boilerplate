import type { Response } from 'express';
import type { AuthRequest, TypedRequest } from '@src/types/typed-request';
import { APIResponse } from '@src/utils/api-response';
import { APIError } from '@src/utils/api-error';
import { UserService } from '@src/services/user.service';
import { UpdateUserDto } from '@src/dtos/users.dto';
import { checkPermissions } from '@src/utils/permission-checker';

export class UserController {
    constructor(private userService: UserService) {}

    getAllUsers = async (req: AuthRequest, res: Response) => {
        const { count, offset } = req.query;
        const users = await this.userService.getAllUsers(
            count ? parseInt(count as string, 10) : undefined,
            offset ? parseInt(offset as string, 10) : undefined
        );
        new APIResponse(users).send(res);
    };

    getUserById = async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const user = await this.userService.getUserById(id as string);
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

    updateUser = async (req: TypedRequest<UpdateUserDto>, res: Response) => {
        const userSession = req.user;
        const userToUpdateData = req.body;
        const userToUpdateId = req.params.id as string;

        if (!userToUpdateData || !userSession || !userToUpdateId) {
            throw APIError.badRequest('Invalid request data');
        }

        const updatedUser = await this.userService.updateUser(
            userToUpdateId,
            userToUpdateData,
            userSession
        );

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

    deleteUser = async (req: AuthRequest, res: Response) => {
        const userSession = req.user;
        const userToDeleteId = req.params.id as string;

        if (!userSession || !userToDeleteId) {
            throw APIError.badRequest('Invalid request data');
        }

        const canDeleteUser = checkPermissions(userSession).isAdmin();

        if (!canDeleteUser) {
            throw APIError.notFound('Resource not reachable');
        }

        await this.userService.deleteUser(userToDeleteId);

        new APIResponse({ message: 'User deleted successfully' }).send(res);
    };
}
