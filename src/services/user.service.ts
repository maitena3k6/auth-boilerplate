import { In, Repository } from 'typeorm';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { AuthUtils } from '../utils/auth.utils';
import { NotFoundError } from '../utils/errors.utils';

export class UserService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly roleRepository: Repository<Role>
    ) {}

    async getByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { email },
            relations: ['roles'],
        });
    }

    async getById(id: string): Promise<User | null> {
        return this.userRepository.findOne({
            where: { id },
            relations: ['roles'],
        });
    }

    async getAll(count?: number, offset?: number): Promise<User[]> {
        return this.userRepository.find({
            relations: ['roles'],
            take: count,
            skip: offset,
        });
    }

    async update(
        id: string,
        firstName: string,
        lastName: string,
        email?: string,
        password?: string,
        roleNames?: string[],
        avatar?: string
    ): Promise<User | null> {
        const user = await this.getById(id);
        if (!user) {
            return null;
        }

        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        if (email) user.email = email;
        if (password) user.password = await AuthUtils.hashPassword(password);
        if (roleNames) {
            const roles = await this.roleRepository.findBy({
                id: In(roleNames),
            });
            user.roles = roles;
        }
        if (avatar) user.avatar = avatar;

        return this.userRepository.save(user);
    }

    async disable(id: string): Promise<boolean> {
        const user = await this.getById(id);
        if (!user) {
            throw new NotFoundError('User not found');
        }
        user.isActive = false;
        await this.userRepository.save(user);
        return true;
    }
}
