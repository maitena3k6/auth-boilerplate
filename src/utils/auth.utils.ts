import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '@src/entities/User';

export class AuthUtils {
    static async hashPassword(password: string): Promise<string> {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    static async comparePassword(
        plainPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static generateToken(user: User): string {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                roles: user.roles.map((r) => r.name),
            },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );
    }

    static generateRefreshToken(user: User): string {
        return jwt.sign(
            { id: user.id },
            process.env.JWT_REFRESH_SECRET || 'refresh_secret',
            { expiresIn: '30d' }
        );
    }
}
