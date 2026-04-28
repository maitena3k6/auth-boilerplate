import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@src/types/typed-request';
import { PERMISSIONS, type Permission } from '@src/types/permissions';
import { PermissionChecker } from '@src/utils/permission-checker';
import { APIError } from '@src/utils/api-error';

export const requirePermissions = (...requiredPermissions: Permission[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw APIError.unauthorized('User not authenticated');
        }

        const checker = new PermissionChecker(req.user);

        if (!checker.hasAll(...requiredPermissions)) {
            throw APIError.forbidden(
                `Missing required permissions: ${requiredPermissions.join(', ')}`
            );
        }

        next();
    };
};

export const requireAnyPermission = (...permissions: Permission[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw APIError.unauthorized('User not authenticated');
        }

        const checker = new PermissionChecker(req.user);

        if (!checker.hasAny(...permissions)) {
            throw APIError.forbidden(
                `Need at least one of these permissions: ${permissions.join(', ')}`
            );
        }

        next();
    };
};

// Atajos comunes
export const requireAdmin = () => requirePermissions(PERMISSIONS.MANAGE_ALL);
