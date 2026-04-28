import { Router } from 'express';
import { UserController } from '@src/controllers/user.controller';
import { authenticate } from '@src/middlewares/auth.middleware';
import { AppDataSource } from '@src/data-source';
import { UserService } from '@src/services/user.service';
import { User } from '@src/entities/User';
import { Role } from '@src/entities/Role';
import { validate } from '@src/middlewares/validate.middleware';
import {
    disableUserValidation,
    getUserByEmailValidation,
    getUserByIdValidation,
    updateUserValidation,
} from '@src/validators/users.validator';
import { asyncHandler } from '@src/utils/async-handler';

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const userService = new UserService(userRepository, roleRepository);
const userController = new UserController(userService);

router.use(authenticate);

router.get('/', asyncHandler(userController.getAllUsers));
router.get('/profile', asyncHandler(userController.getProfile));
router.put(
    '/profile',
    validate(updateUserValidation),
    asyncHandler(userController.updateProfile)
);
router.get(
    '/email/:email',
    validate(getUserByEmailValidation),
    asyncHandler(userController.getUserByEmail)
);
router.get(
    '/:id',
    validate(getUserByIdValidation),
    asyncHandler(userController.getUserById)
);
router.delete(
    '/:id',
    validate(disableUserValidation),
    asyncHandler(userController.disableProfile)
);

export default router;
