import ResponseApiDefault from "./ResponseApiDefault";

export type Departamentos = {
    id: string;
    name: string;
    responsavel: string;
    cpf?: string;
    createdAt: string;
    updatedAt: string;
}
export interface DepartamentosGetResponse extends ResponseApiDefault{
    data: Departamentos[]
}

export interface DepartamentosGetByIdResponse extends ResponseApiDefault {
    data?: Departamentos
}

export type DepartamentosCreateRequestBody = {
    name: string;
    responsavel: string;
    cpf?: string;
}

export type DepartamentosUpdateRequest = {
    id: string;
} & DepartamentosCreateRequestBody
