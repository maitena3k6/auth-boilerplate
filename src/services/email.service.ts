import { resend, EMAIL_FROM, APP_URL } from '@src/email-source';
import { APIError } from '@src/utils/api-error';

export class EmailService {
    async sendVerificationEmail(
        to: string,
        username: string,
        token: string
    ): Promise<void> {
        const verificationUrl = `${APP_URL}/api/v1/auth/verify-email?token=${token}`;

        try {
            await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject: 'Verify your email address',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .button { 
                                display: inline-block; 
                                padding: 12px 24px; 
                                background-color: #4F46E5; 
                                color: white; 
                                text-decoration: none; 
                                border-radius: 6px;
                                margin: 20px 0;
                            }
                            .footer { font-size: 12px; color: #666; margin-top: 30px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Welcome to our platform, ${username}!</h2>
                            <p>Please verify your email address to activate your account.</p>
                            <a href="${verificationUrl}" class="button">Verify Email</a>
                            <p>Or copy and paste this link:</p>
                            <code>${verificationUrl}</code>
                            <p>This link will expire in 24 hours.</p>
                            <div class="footer">
                                <p>If you didn't create an account, you can safely ignore this email.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            });
        } catch (error) {
            console.error('Email sending failed:', error);
            throw APIError.internal('Failed to send verification email');
        }
    }

    async sendPasswordResetEmail(
        to: string,
        username: string,
        token: string
    ): Promise<void> {
        const resetUrl = `${APP_URL}/reset-password?token=${token}`;

        try {
            await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject: 'Reset your password',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .button { 
                                display: inline-block; 
                                padding: 12px 24px; 
                                background-color: #4F46E5; 
                                color: white; 
                                text-decoration: none; 
                                border-radius: 6px;
                                margin: 20px 0;
                            }
                            .warning { color: #DC2626; font-size: 14px; }
                            .footer { font-size: 12px; color: #666; margin-top: 30px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Password Reset Request</h2>
                            <p>Hello ${username},</p>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                            <p>Or copy and paste this link:</p>
                            <code>${resetUrl}</code>
                            <p class="warning">This link will expire in 1 hour.</p>
                            <div class="footer">
                                <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            });
        } catch (error) {
            console.error('Email sending failed:', error);
            throw APIError.internal('Failed to send password reset email');
        }
    }

    async sendWelcomeEmail(to: string, username: string): Promise<void> {
        try {
            await resend.emails.send({
                from: EMAIL_FROM,
                to,
                subject: 'Welcome to our platform!',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .footer { font-size: 12px; color: #666; margin-top: 30px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h2>Welcome ${username}!</h2>
                            <p>Thank you for joining our platform. We're excited to have you on board!</p>
                            <p>Your account has been successfully verified.</p>
                            <p>Now you can:</p>
                            <ul>
                                <li>Complete your profile</li>
                                <li>Connect with other users</li>
                                <li>Access all features</li>
                            </ul>
                            <div class="footer">
                                <p>Best regards,<br>The Team</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `,
            });
        } catch (error) {
            console.error('Welcome email failed:', error);
            // No throw error - welcome email is not critical
        }
    }
}
