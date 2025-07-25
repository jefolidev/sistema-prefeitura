import ResponseApiDefault from "./ResponseApiDefault";
import { UserPermissions } from "./UserPermissions";

export type Users = {
    id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    cpf: string;
    permissions: UserPermissions[]
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface UsersGetResponse extends ResponseApiDefault {
    data: Users[]
}

export interface UsersGetByIdResponse extends ResponseApiDefault {
    data?: Users
}

export type UsersCreateRequest = {
    name: string;
    surname: string;
    username: string;
    email: string;
    cpf: string;
    password: string;
}

export type UsersUpdateRequest = {
    id: string;
    name: string;
}