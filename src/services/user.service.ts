import type { UpdateProfileDto } from '@src/dtos/users.dto';
import { In, Repository } from 'typeorm';
import { Role } from '@src/entities/Role';
import { User } from '@src/entities/User';
import { APIError } from '@src/utils/api-error';

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>
    ) {}

    getByEmail = async (email: string): Promise<User | null> => {
        return this.userRepository.findOne({
            where: { email },
            relations: ['roles'],
        });
    };

    getById = async (id: string): Promise<User | null> => {
        return this.userRepository.findOne({
            where: { id },
            relations: ['roles'],
        });
    };

    getAll = async (count?: number, offset?: number): Promise<User[]> => {
        return this.userRepository.find({
            relations: ['roles'],
            take: count,
            skip: offset,
        });
    };

    update = async (
        userData: UpdateProfileDto & { id: string; roleNames?: string[] }
    ): Promise<User | null> => {
        const { id, firstName, lastName, email, roleNames, avatar } = userData;

        const user = await this.getById(id);
        if (!user) {
            return null;
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (roleNames) {
            const roles = await this.roleRepository.findBy({
                id: In(roleNames),
            });
            user.roles = roles;
        }
        if (avatar) user.avatar = avatar;

        return this.userRepository.save(user);
    };

    disable = async (id: string): Promise<boolean> => {
        const user = await this.getById(id);
        if (!user) {
            throw APIError.notFound('User not found');
        }
        user.isActive = false;
        await this.userRepository.save(user);
        return true;
    };
}
