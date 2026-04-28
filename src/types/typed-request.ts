import type { Request } from 'express';
import { User } from '@src/entities/User';

export type AuthRequest = { user?: User } & Omit<Request, 'body'>;

export type TypedRequest<T> = AuthRequest & {
    body: T;
};
