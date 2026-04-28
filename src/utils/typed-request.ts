import type { Request } from 'express';
import { User } from '@src/entities/User';

export type AuthRequest = { user?: User } & Request;

export type TypedRequest<T> = {
    body: T;
} & AuthRequest &
    Omit<Request, 'body'>;
