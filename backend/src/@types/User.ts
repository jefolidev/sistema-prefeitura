
export type UserRegisterRequest = {
    name?: string;
    surname?: string;
    user?: string;
    email?: string;
    password?: string;
    cpf?: string;
};

export type ServidorRegisterRequestBody = {
    name?: string;
    surname?: string;
    cpf?: string;
}

export type UserLoginRequest = {
    user: string;
    senha: string;
};

export type JwtUser = {
    user: string;
    id: string;
    nome: string;
    isSuperAdmin: boolean;
    iat: number;
    exp: number;
};

export type UserVerifyRequest = {
    user: string;
    senha: string;
    code: string;
};

export type UserCodeVerifyRedis = {
    codigo: string;
    nTentativas: number;
}