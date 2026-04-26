import { Router } from 'express';
import { UserController } from '../../controllers/user.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { AppDataSource } from '../../data-source';
import { UserService } from '../../services/user.service';
import { User } from '../../entities/User';
import { Role } from '../../entities/Role';

const router = Router();

const userRepository = AppDataSource.getRepository(User);
const roleRepository = AppDataSource.getRepository(Role);
const userService = new UserService(userRepository, roleRepository);
const userController = new UserController(userService);

router.use(authenticate);

router.get('/', userController.getAllUsers);
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/email/:email', userController.getUserByEmail);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.disableProfile);

export default router;
