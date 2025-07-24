import ResponseApiDefault from "./ResponseApiDefault";

export type Secretarias = {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}
export interface SecretariasGetResponse extends ResponseApiDefault{
    data: Secretarias[]
}

export interface SecretariasGetByIdResponse extends ResponseApiDefault {
    data?: Secretarias
}

export type SecretariasCreateRequest = {
    name: string;
}

export type SecretariasUpdateRequest = {
    id: string;
    name: string;
}