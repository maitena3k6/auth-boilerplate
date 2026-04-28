import type { Application } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from '@src/middlewares/error-handler';
import router from './routes/v1/index.routes';

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

app.use(errorHandler);

export { app };
