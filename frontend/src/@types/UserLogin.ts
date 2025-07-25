// import

import ResponseApiDefault from "./ResponseApiDefault";

export interface UserLoginResponseSuccess extends ResponseApiDefault {
    data: string//Token
}
export interface UserLoginResponseError extends ResponseApiDefault {
    data: unknown
}

export interface JwtPayload {
    id: string;
    user: string;
    isSuperAdmin: boolean;
}