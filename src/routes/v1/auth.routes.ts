import { Router } from 'express';
import { AuthController } from '@src/controllers/auth.controller';
import { User } from '@src/entities/User';
import { Session } from '@src/entities/Session';
import { AuthService } from '@src/services/auth.service';
import { AppDataSource } from '@src/data-source';
import { Role } from '@src/entities/Role';
import { validate } from '@src/middlewares/validate.middleware';
import {
    forgotPasswordValidation,
    loginValidation,
    refreshTokenValidation,
    registerValidation,
    resendVerificationValidation,
    resetPasswordValidation,
} from '@src/validators/auth.validator';
import { asyncHandler } from '@src/utils/async-handler';
import { EmailService } from '@src/services/email.service';

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const sessionRepository = AppDataSource.getRepository(Session);
const roleRepository = AppDataSource.getRepository(Role);
const emailService = new EmailService();
const authService = new AuthService(
    userRepository,
    sessionRepository,
    roleRepository,
    emailService
);

const authController = new AuthController(authService);

router.post(
    '/login',
    validate(loginValidation),
    asyncHandler(authController.login)
);

router.post(
    '/register',
    validate(registerValidation),
    asyncHandler(authController.register)
);

router.post(
    '/refresh',
    validate(refreshTokenValidation),
    asyncHandler(authController.refreshToken)
);

router.post('/logout', asyncHandler(authController.logout));

router.get('/verify-email', asyncHandler(authController.verifyEmail));

router.post(
    '/resend-verification',
    validate(resendVerificationValidation),
    asyncHandler(authController.resendVerification)
);

router.post(
    '/forgot-password',
    validate(forgotPasswordValidation),
    asyncHandler(authController.forgotPassword)
);

router.post(
    '/reset-password',
    validate(resetPasswordValidation),
    asyncHandler(authController.resetPassword)
);

export default router;
