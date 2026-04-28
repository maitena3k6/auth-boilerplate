import 'reflect-metadata';
import * as path from 'path';
import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Role } from './entities/Role';
import { Session } from './entities/Session';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'user',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || '',
    synchronize: false,
    logging: true,
    entities: [User, Role, Session],
    migrations: [path.join(__dirname, 'build/src/migrations/**/*.{ts,js}')],
    subscribers: [],
});

