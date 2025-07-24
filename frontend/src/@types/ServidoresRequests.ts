import ResponseApiDefault from "./ResponseApiDefault";

export type Servidor = {
    id: string;
    name: string;
    surname: string;
    cpf: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ServidoresGetResponse extends ResponseApiDefault {
    data: Servidor[];
}

export interface ServidoresGetByIdResponse extends ResponseApiDefault {
    data?: Servidor;
}

export type ServidorCreateRequest = {
    name: string;
    surname: string;
    cpf: string;
}

export type ServidorUpdateRequest = {
    id: string;
    name: string;
}
