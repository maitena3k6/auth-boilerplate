import { AppDataSource } from '../data-source';
import { Role } from '../entities/Role';
import { User } from '../entities/User';
import { AuthUtils } from '../utils/auth.utils';


export class UserService {
    static async create(newUser: User) {
        try {
            const { email, username, password, firstName, lastName } = newUser;

            const userRepository = AppDataSource.getRepository(User);

            const existingUser = await userRepository.findOne({
                where: [{ email }, { username }],
            });

            if (existingUser) {
                throw Error('User with this email or username already exists');
            }

            const hashedPassword = await AuthUtils.hashPassword(password);

            const user = userRepository.create({
                email,
                username,
                password: hashedPassword,
                firstName,
                lastName,
            });

            // Asignar rol de usuario por defecto
            const roleRepository = AppDataSource.getRepository(Role);
            const defaultRole = await roleRepository.findOne({
                where: { name: 'user' },
            });

            if (defaultRole) {
                user.roles = [defaultRole];
            }

            await userRepository.save(user);

            const token = AuthUtils.generateToken(user);
            const refreshToken = AuthUtils.generateRefreshToken(user);

            return {
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                },
                token,
                refreshToken,
            };
        } catch (error) {
            throw Error('Error registering user');
        }
    }
}
