import { Router } from 'express';
import { AuthController } from '@src/controllers/auth.controller';
import { User } from '@src/entities/User';
import { Session } from '@src/entities/Session';
import { AuthService } from '@src/services/auth.service';
import { AppDataSource } from '@src/data-source';
import { Role } from '@src/entities/Role';
import { validate } from '@src/middlewares/validate.middleware';
import {
    loginValidation,
    refreshTokenValidation,
    registerValidation,
} from '@src/validators/auth.validator';
import { asyncHandler } from '@src/utils/async-handler';

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const sessionRepository = AppDataSource.getRepository(Session);
const roleRepository = AppDataSource.getRepository(Role);
const authService = new AuthService(
    userRepository,
    sessionRepository,
    roleRepository
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

export default router;
