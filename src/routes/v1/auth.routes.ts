import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';
import { User } from '../../entities/User';
import { Session } from '../../entities/Session';
import { AuthService } from '../../services/auth.service';
import { AppDataSource } from '../../data-source';
import { Role } from '../../entities/Role';
import { asyncHandler } from 'express-api-utils';

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

router.post('/login', asyncHandler(authController.login));
router.post('/register', asyncHandler(authController.register));
router.post('/logout', asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refreshToken));

export default router;
