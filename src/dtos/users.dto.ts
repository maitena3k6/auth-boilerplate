import { Role } from "@src/entities/Role";

export interface UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    roles?: Role[]; 
}
