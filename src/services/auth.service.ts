import type { Repository } from 'typeorm';
import { APIError } from 'express-api-utils';
import { Role } from '../entities/Role';
import { Session } from '../entities/Session';
import { User } from '../entities/User';
import { AuthUtils } from '../utils/auth.utils';

export class AuthService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly sessionRepository: Repository<Session>,
        private readonly roleRepository: Repository<Role>
    ) {}

    login = async (
        email: string,
        password: string,
        ipAddress: string,
        userAgent: string
    ) => {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.roles', 'roles')
            .where('user.email = :email', { email })
            .getOne();

        if (!user) {
            throw APIError.notFound('User not found');
        }

        const isValidPassword = await AuthUtils.comparePassword(
            password,
            user.password
        );

        if (!isValidPassword || !user.isActive) {
            throw APIError.unauthorized('Invalid credentials');
        }

        // Actualizar último login
        user.lastLogin = new Date();
        await this.userRepository.save(user);

        const token = AuthUtils.generateToken(user);
        const refreshToken = AuthUtils.generateRefreshToken(user);

        // Guardar sesión
        const session = this.sessionRepository.create({
            token: refreshToken,
            userId: user.id,
            ipAddress,
            userAgent,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        });
        await this.sessionRepository.save(session);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                roles: user.roles,
            },
            token,
            refreshToken,
        };
    };

    register = async (
        email: string,
        username: string,
        password: string,
        firstName?: string,
        lastName?: string
    ) => {
        const existingUser = await this.userRepository.findOne({
            where: [{ email }, { username }],
        });

        if (existingUser) {
            throw APIError.badRequest('Email or username already exists');
        }

        const hashedPassword = await AuthUtils.hashPassword(password);

        const user = this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
        });

        // Asignar rol de usuario por defecto
        const defaultRole = await this.roleRepository.findOne({
            where: { name: 'user' },
        });

        if (defaultRole) {
            user.roles = [defaultRole];
        }

        await this.userRepository.save(user);

        const token = AuthUtils.generateToken(user);
        const refreshToken = AuthUtils.generateRefreshToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
            },
            token,
            refreshToken,
        };
    };

    refreshToken = async (oldRefreshToken: string) => {
        const session = await this.sessionRepository.findOne({
            where: { token: oldRefreshToken, isValid: true },
            relations: ['user', 'user.roles'],
        });

        if (!session || session.expiresAt < new Date()) {
            throw APIError.unauthorized('Invalid or expired refresh token');
        }

        const user = session.user;

        const newToken = AuthUtils.generateToken(user);
        const newRefreshToken = AuthUtils.generateRefreshToken(user);

        // Invalidate old refresh token
        session.isValid = false;
        await this.sessionRepository.save(session);

        // Save new refresh token
        const newSession = this.sessionRepository.create({
            token: newRefreshToken,
            userId: user.id,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        });
        await this.sessionRepository.save(newSession);

        return {
            message: 'Token refreshed successfully',
            token: newToken,
            refreshToken: newRefreshToken,
        };
    };

    logout = async (token?: string, user?: User) => {
        if (!token || !user) {
            throw APIError.unauthorized('Invalid token or user');
        }

        // Buscar la sesión específica por token y userId
        const session = await this.sessionRepository.findOne({
            where: {
                token: token,
                userId: user.id,
                isValid: true,
            },
        });
        
        if (
            !session ||
            session.expiresAt < new Date() ||
            !session.user.isActive
        ) {
            throw APIError.unauthorized('Invalid or expired refresh token');
        }

        session.isValid = false;
        await this.sessionRepository.save(session);

        return { message: 'Logged out successfully' };
    };
}
