import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';
import profileRoutes from './profile.routes';

const router = Router();
const apiRoutes = Router();

apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/users', userRoutes);
apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/profile', profileRoutes);

router.use('/api/v1', apiRoutes);

export default router;
