import { MoreThan, type Repository } from 'typeorm';
import crypto from 'crypto';
import { Role } from '@src/entities/Role';
import { User } from '@src/entities/User';
import { Session } from '@src/entities/Session';
import { AuthUtils } from '@src/utils/auth.utils';
import { APIError } from '@src/utils/api-error';
import { EmailService } from './email.service';

export class AuthService {
    constructor(
        private readonly userRepository: Repository<User>,
        private readonly sessionRepository: Repository<Session>,
        private readonly roleRepository: Repository<Role>,
        private readonly emailService: EmailService
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

        if (!user.isEmailVerified) {
            throw APIError.unauthorized(
                'Please verify your email before logging in'
            );
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
            user: user,
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

        const emailVerificationToken = crypto.randomBytes(32).toString('hex');

        const hashedPassword = await AuthUtils.hashPassword(password);

        const user = this.userRepository.create({
            email,
            username,
            password: hashedPassword,
            firstName,
            lastName,
            isEmailVerified: false,
            emailVerificationToken,
        });

        const defaultRole = await this.roleRepository.findOne({
            where: { name: 'user' },
        });

        if (defaultRole) {
            user.roles = [defaultRole];
        }

        await this.userRepository.save(user);

        await this.emailService.sendVerificationEmail(
            email,
            username,
            emailVerificationToken
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                isEmailVerified: user.isEmailVerified,
            },
        };
    };

    refreshToken = async (oldRefreshToken: string) => {
        const session = await this.sessionRepository.findOne({
            where: { token: oldRefreshToken, isValid: true },
            relations: ['user', 'user.roles'],
        });

        console.log('Session :', session);

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

    verifyEmail = async (token: string): Promise<{ message: string }> => {
        const user = await this.userRepository.findOne({
            where: { emailVerificationToken: token },
        });

        if (!user) {
            throw APIError.badRequest('Invalid or expired verification token');
        }

        if (user.isEmailVerified) {
            throw APIError.badRequest('Email already verified');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        await this.userRepository.save(user);

        this.emailService
            .sendWelcomeEmail(user.email, user.username)
            .catch((error) =>
                console.error('Failed to send welcome email:', error)
            );

        return { message: 'Email verified successfully. You can now log in.' };
    };

    resendVerificationEmail = async (
        email: string
    ): Promise<{ message: string }> => {
        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw APIError.notFound('User not found');
        }

        if (user.isEmailVerified) {
            throw APIError.badRequest('Email already verified');
        }

        const newToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = newToken;
        await this.userRepository.save(user);

        // Reenviar email
        await this.emailService.sendVerificationEmail(
            email,
            user.username,
            newToken
        );

        return {
            message: 'Verification email resent. Please check your inbox.',
        };
    };

    forgotPassword = async (email: string): Promise<{ message: string }> => {
        const user = await this.userRepository.findOne({ where: { email } });
        const message =
            'If an account exists, you will receive a password reset email.';

        if (!user) {
            return { message };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora
        await this.userRepository.save(user);

        await this.emailService.sendPasswordResetEmail(
            email,
            user.username,
            resetToken
        );

        return { message };
    };

    resetPassword = async (
        token: string,
        newPassword: string
    ): Promise<{ message: string }> => {
        const user = await this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: MoreThan(new Date()),
            },
        });

        if (!user) {
            throw APIError.badRequest('Invalid or expired reset token');
        }

        const hashedPassword = await AuthUtils.hashPassword(newPassword);
        user.password = hashedPassword;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = null as any;
        await this.userRepository.save(user);

        // Invalidar todas las sesiones del usuario por seguridad
        await this.sessionRepository.update(
            { user: { id: user.id }, isValid: true },
            { isValid: false }
        );

        return {
            message:
                'Password reset successfully. Please log in with your new password.',
        };
    };
}
