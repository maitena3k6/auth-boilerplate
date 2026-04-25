import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();
const apiRouter = Router();

apiRouter.use('/', authRoutes);

router.use('/api/v1', apiRouter);

export default router;
