import { UpdateProfileDto } from '@src/dtos/profile.dto';
import { Role } from '@src/entities/Role';
import { User } from '@src/entities/User';
import { APIError } from '@src/utils/api-error';
import { checkPermissions } from '@src/utils/permission-checker';
import { Like, Repository } from 'typeorm';

export class ProfileService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>
    ) {}

    getProfileById = async (userId: string) => {
        const profile = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['roles'],
        });

        if (!profile || !profile.isActive) {
            throw APIError.badRequest('Profile not found');
        }

        return {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            avatar: profile.avatar,
            roles: profile.roles.map((role) => ({
                name: role.name,
                permissions: role.permissions,
            })),
        };
    };

    getPublicProfile = async (username: string) => {
        const profile = await this.userRepository.findOne({
            where: { username },
            relations: ['roles'],
        });

        if (!profile || !profile.isActive) {
            throw APIError.badRequest('Profile not found');
        }

        return {
            id: profile.id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatar,
            roles: profile.roles.map((role) => ({
                name: role.name,
                permissions: role.permissions,
            })),
        };
    };

    searchProfiles = async (params: any) => {
        const { query, limit, offset } = params;

        const whereCondition = query
            ? [
                  { firstName: Like(`%${query}%`), isActive: true },
                  { lastName: Like(`%${query}%`), isActive: true },
                  { username: Like(`%${query}%`), isActive: true },
              ]
            : { isActive: true };

        const users = await this.userRepository.find({
            where: whereCondition,
            select: [
                'id',
                'firstName',
                'lastName',
                'avatar',
                'username',
                'createdAt',
            ],
            relations: ['roles'],
            take: limit,
            skip: offset,
            order: { createdAt: 'DESC' },
        });
        
        return users.map((user) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            roles: user.roles?.map((role) => ({
                name: role.name,
                permissions: role.permissions,
            })),
        }));
    };

    updateProfile = async (userId: string, profileData: UpdateProfileDto) => {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw APIError.badRequest('User not found');
        }

        if (profileData.firstName) user.firstName = profileData.firstName;
        if (profileData.lastName) user.lastName = profileData.lastName;
        if (profileData.avatar) user.avatar = profileData.avatar;

        return this.userRepository.save(user);
    };

    deleteProfile = async (userId: string) => {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) {
            throw APIError.badRequest('User not found');
        }
        const canModifyUser = checkPermissions(user).isOwner(userId);

        if (!canModifyUser) {
            throw APIError.forbidden('Resource not reachable');
        }

        user.isActive = false;

        await this.userRepository.save(user);
        return true;
    };

    getRoles = async (userId: string) => {
        const roles = await this.roleRepository
            .createQueryBuilder('role')
            .innerJoin('role.users', 'user', 'user.id = :userId', { userId })
            .getMany();

        return roles;
    };
}
