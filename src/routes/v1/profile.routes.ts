import { Router } from 'express';
import { authenticate } from '@src/middlewares/auth.middleware';
import { AppDataSource } from '@src/data-source';
import { User } from '@src/entities/User';
import { Role } from '@src/entities/Role';
import { validate } from '@src/middlewares/validate.middleware';
import { updateUserValidation } from '@src/validators/users.validator';
import { asyncHandler } from '@src/utils/async-handler';
import { ProfileService } from '@src/services/profile.service';
import { ProfileController } from '@src/controllers/profile.controller';
import { requirePermissions } from '@src/middlewares/permissions.middleware';

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const profileService = new ProfileService(userRepository, roleRepository);
const profileController = new ProfileController(profileService);

router.use(authenticate);

router.get(
    '/',
    requirePermissions('read:profile'),
    asyncHandler(profileController.getProfile)
);

router.get('/search', asyncHandler(profileController.searchProfiles));

router.get(
    '/:username',
    requirePermissions('read:profile'),
    asyncHandler(profileController.getPublicProfile)
);

router.put(
    '/',
    requirePermissions('update:profile'),
    validate(updateUserValidation),
    asyncHandler(profileController.updateProfile)
);

router.delete(
    '/',
    requirePermissions('disable:profile'),
    asyncHandler(profileController.deleteProfile)
);

export default router;
