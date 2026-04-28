export const PERMISSIONS = {
    // Users
    CREATE_USER: 'create:user',
    READ_USER: 'read:user',
    UPDATE_USER: 'update:user',
    DELETE_USER: 'delete:user',
    MANAGE_USERS: 'manage:users',

    // Roles
    CREATE_ROLE: 'create:role',
    READ_ROLE: 'read:role',
    UPDATE_ROLE: 'update:role',
    DELETE_ROLE: 'delete:role',
    MANAGE_ROLES: 'manage:roles',

    // Profile
    READ_PROFILE: 'read:profile',
    UPDATE_PROFILE: 'update:profile',
    DISABLE_PROFILE: 'disable:profile',

    // Special
    MANAGE_ALL: 'manage:all',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_GROUPS = {
    USER_MANAGEMENT: [
        PERMISSIONS.CREATE_USER,
        PERMISSIONS.READ_USER,
        PERMISSIONS.UPDATE_USER,
        PERMISSIONS.DELETE_USER,
    ] as Permission[],

    ROLE_MANAGEMENT: [
        PERMISSIONS.CREATE_ROLE,
        PERMISSIONS.READ_ROLE,
        PERMISSIONS.UPDATE_ROLE,
        PERMISSIONS.DELETE_ROLE,
    ] as Permission[],

    PROFILE_MANAGEMENT: [
        PERMISSIONS.READ_PROFILE,
        PERMISSIONS.UPDATE_PROFILE,
        PERMISSIONS.DISABLE_PROFILE,
    ] as Permission[],
    
    ALL: [PERMISSIONS.MANAGE_ALL] as Permission[],
} as const;
