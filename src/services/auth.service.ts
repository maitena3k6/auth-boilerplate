import { AppDataSource } from '../data-source';
import { Role } from '../entities/Role';
import { Session } from '../entities/Session';
import { User } from '../entities/User';
import { AuthUtils } from '../utils/auth.utils';
import { BadRequestError, NotFoundError } from '../utils/errors.utils';

export interface AuthRequest extends Request {
    user?: User;
}

export class AuthService {
    static async register(
        email: string,
        username: string,
        password: string,
        firstName: string,
        lastName: string
    ) {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const existingUser = await userRepository.findOne({
                where: [{ email }, { username }],
            });

            if (existingUser) {
                throw new BadRequestError(
                    'User with this email or username already exists'
                );
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
            console.error(error);
            throw error;
        }
    }

    static async login(
        email: string,
        password: string,
        ipAddress: string,
        userAgent: string
    ) {
        try {
            const userRepository = AppDataSource.getRepository(User);

            const user = await userRepository
                .createQueryBuilder('user')
                .addSelect('user.password')
                .leftJoinAndSelect('user.roles', 'roles')
                .where('user.email = :email', { email })
                .getOne();

            if (!user) {
                throw new NotFoundError('User not found');
            }

            const isValidPassword = await AuthUtils.comparePassword(
                password,
                user.password
            );

            if (!isValidPassword || !user.isActive) {
                throw Error('Invalid credentials');
            }

            // Actualizar último login
            user.lastLogin = new Date();
            await userRepository.save(user);

            const token = AuthUtils.generateToken(user);
            const refreshToken = AuthUtils.generateRefreshToken(user);

            // Guardar sesión
            const sessionRepository = AppDataSource.getRepository(Session);
            const session = sessionRepository.create({
                token: refreshToken,
                userId: user.id,
                ipAddress,
                userAgent,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            });
            await sessionRepository.save(session);

            return {
                message: 'Login successful',
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                },
                token,
                refreshToken,
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static async logout(token?: string, user?: User) {
        try {
            // const token = req.headers.authorization?.replace('Bearer ', '');
            const sessionRepository = AppDataSource.getRepository(Session);

            if (!token || !user) {
                throw Error('Unauthorized');
            }

            await sessionRepository.update(user.id, {
                token,
                isValid: false,
            });

            return { message: 'Logged out successfully' };
        } catch (error) {
            throw Error('Error logging out');
        }
    }
}
