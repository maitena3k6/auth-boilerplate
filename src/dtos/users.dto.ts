import { Role } from "@src/entities/Role";

export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    roles?: Role[]; 
}
