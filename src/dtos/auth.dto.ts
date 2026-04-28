export interface RegisterDto {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

export interface RefreshTokenDto {
    refreshToken: string;
}

