import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {
    errorHandler,
    notFoundHandler,
} from './middlewares/error.middleware';
import router from './routes/v1/index.routes';

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('Hello World Baby!');
});

app.use(router);

// Manejo de rutas no encontradas (DEBE ir antes del errorHandler)
app.use(notFoundHandler);

// Manejo global de errores (DEBE ser el último middleware)
app.use(errorHandler);

export default app;
