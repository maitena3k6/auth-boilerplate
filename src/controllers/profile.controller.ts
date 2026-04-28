import type { Response } from 'express';
import type { AuthRequest, TypedRequest } from '@src/types/typed-request';
import { APIResponse } from '@src/utils/api-response';
import { APIError } from '@src/utils/api-error';
import { ProfileService } from '@src/services/profile.service';
import { UpdateProfileDto } from '@src/dtos/profile.dto';

export class ProfileController {
    constructor(private profileService: ProfileService) {}

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

    getPublicProfile = async (req: AuthRequest, res: Response) => {
        const { username } = req.params;

        if (!username) {
            throw APIError.badRequest('Username is required');
        }

        const profile = await this.profileService.getPublicProfile(username as string);
        new APIResponse(profile).send(res);
    };

    searchProfiles = async (req: AuthRequest, res: Response) => {
        const { query, limit = 20, offset = 0 } = req.query;
console.log(query, limit,offset);

        const profiles = await this.profileService.searchProfiles({
            query,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
        });
        new APIResponse(profiles).send(res);
    };

    updateProfile = async (
        req: TypedRequest<UpdateProfileDto>,
        res: Response
    ) => {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        const { firstName, lastName, avatar } = req.body;

        const userData = {
            firstName,
            lastName,
            avatar,
        };

        const updatedUser = await this.profileService.updateProfile(
            user.id,
            userData
        );
        const roles = await this.profileService.getRoles(user.id);

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
            roles: roles?.map((role) => role.name),
        }).send(res);
    };

    deleteProfile = async (req: AuthRequest, res: Response) => {
        const user = req.user;
        if (!user) {
            throw APIError.unauthorized('Unauthorized');
        }

        await this.profileService.deleteProfile(user.id);

        new APIResponse({ message: 'Profile deleted successfully' }).send(res);
    };
}
