import { Router } from 'express';
import { asyncHandler } from 'express-api-utils';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { AuthService } from '../../services/auth.service';
import { AppDataSource } from '../../data-source';
import { Role } from '../../entities/Role';
import { validate } from '../../middlewares/validate.middleware';
import {
    loginValidation,
    refreshTokenValidation,
    registerValidation,
} from '../../validators/auth.validator';

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
