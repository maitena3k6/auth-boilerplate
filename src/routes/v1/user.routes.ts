import { Router } from 'express';
import { asyncHandler } from 'express-api-utils';
import { UserController } from '../../controllers/user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { AppDataSource } from '../../data-source';
import { UserService } from '../../services/user.service';
import { User } from '../../entities/User';
import { Role } from '../../entities/Role';
import { validate } from '../../middlewares/validate.middleware';
import {
    disableUserValidation,
    getUserByEmailValidation,
    getUserByIdValidation,
    updateUserValidation,
} from '../../validators/users.validator';

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
