import type { UpdateUserDto } from '@src/dtos/users.dto';
import { In, Repository } from 'typeorm';
import { Role } from '@src/entities/Role';
import { User } from '@src/entities/User';
import { APIError } from '@src/utils/api-error';
import { checkPermissions } from '@src/utils/permission-checker';

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>
    ) {}

    getAllUsers = (count?: number, offset?: number): Promise<User[]> => {
        return this.userRepository.find({
            relations: ['roles'],
            take: count,
            skip: offset,
        });
    };

    getUserById = (id: string): Promise<User | null> => {
        return this.userRepository.findOne({
            where: { id },
            relations: ['roles'],
        });
    };

    updateUser = async (
        userIdToUpdate: string,
        userData: UpdateUserDto,
        currentUser: User
    ): Promise<User | null> => {
        const { firstName, lastName, email, roles, avatar } = userData;

        const canModifyUser =
            checkPermissions(currentUser).canModifyUser(userIdToUpdate);

        const userToUpdate = await this.userRepository.findOneBy({
            id: userIdToUpdate,
        });

        if (!canModifyUser || !userToUpdate) {
            throw APIError.notFound('Resource not reachable');
        }

        if (email && email !== userToUpdate.email) {
            const emailExists = await this.userRepository.findOneBy({ email });
            if (emailExists) {
                throw APIError.badRequest('Email already in use');
            }
            userToUpdate.email = email;
        }

        if (firstName) userToUpdate.firstName = firstName;
        if (lastName) userToUpdate.lastName = lastName;
        if (avatar) userToUpdate.avatar = avatar;

        if (roles) {
            const roleIds = roles.map((role) => role.id);
            const validRoles = await this.roleRepository.findBy({
                id: In(roleIds),
            });

            if (validRoles.length !== roles.length) {
                throw APIError.badRequest('One or more roles are invalid');
            }
            userToUpdate.roles = validRoles;
        }

        return this.userRepository.save(userToUpdate);
    };

    deleteUser = async (id: string): Promise<boolean> => {
        const user = await this.getUserById(id);

        if (!user) {
            throw APIError.notFound('User not found');
        }
        const isAdmin = checkPermissions(user).isAdmin();

        if (!isAdmin) {
            throw APIError.forbidden('Resource not reachable');
        }
        await this.userRepository.remove(user);
        return true;
    };
}
