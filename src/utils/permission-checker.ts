import { User } from '@src/entities/User';
import { type Permission, PERMISSIONS } from '@src/types/permissions';

export class PermissionChecker {
    private userPermissions: Set<Permission>;

    constructor(private user: User) {
        this.userPermissions = new Set(
            this.user.roles?.flatMap((role) => role.permissions as Permission[])
        );
    }

    has(permission: Permission): boolean {
        return this.userPermissions.has(permission);
    }

    hasAll(...permissions: Permission[]): boolean {
        return permissions.every((p) => this.userPermissions.has(p));
    }

    hasAny(...permissions: Permission[]): boolean {
        return permissions.some((p) => this.userPermissions.has(p));
    }

    isOwner(resourceUserId: string): boolean {
        return this.user.id === resourceUserId;
    }

    canModifyUser(userIdToModify: string): boolean {
        if (this.hasAny(PERMISSIONS.UPDATE_USER, PERMISSIONS.MANAGE_ALL)) {
            return true; // Admin puede modificar a cualquiera
        }
        return this.isOwner(userIdToModify); // Usuario normal solo su propio perfil
    }

    canViewUser(userIdToView: string): boolean {
        if (this.hasAny(PERMISSIONS.READ_USER, PERMISSIONS.MANAGE_ALL)) {
            return true; // Admin puede ver a cualquiera
        }
        return this.isOwner(userIdToView); // Usuario normal solo su propio perfil
    }

    isAdmin(): boolean {
        return this.has(PERMISSIONS.MANAGE_ALL);
    }

    canManageUsers(): boolean {
        return this.hasAny(PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ALL);
    }

    canManageRoles(): boolean {
        return this.hasAny(PERMISSIONS.MANAGE_ROLES, PERMISSIONS.MANAGE_ALL);
    }

    // debug helper
    getPermissions(): Permission[] {
        return Array.from(this.userPermissions);
    }
}

// Función helper para crear el checker desde un usuario
export const checkPermissions = (user: User): PermissionChecker => {
    return new PermissionChecker(user);
};
