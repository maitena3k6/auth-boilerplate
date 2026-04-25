import { Router } from 'express';
import { AuthController } from '../../controllers/auth.controller';

const router = Router();
const authRouter = Router();

authRouter.post('/login', AuthController.login);
authRouter.post('/register', AuthController.register);
authRouter.post('/logout', AuthController.logout);
authRouter.get('/profile', AuthController.getProfile);

router.use('/auth', authRouter);

export default router;
