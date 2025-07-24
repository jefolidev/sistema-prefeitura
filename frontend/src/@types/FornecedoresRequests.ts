import ResponseApiDefault from "./ResponseApiDefault";

export type Fornecedores = {
    id: string;
    name: string;
    cnpj?: string;
    razaoSocial?: string;
    endereco?: string;
    email?: string;
    telefone?: string;
    observacoes?: string;
    createdAt: string;
    updatedAt: string;
}
export interface FornecedoresGetResponse extends ResponseApiDefault{
    data: Fornecedores[]
}

export interface FornecedoresGetByIdResponse extends ResponseApiDefault {
    data?: Fornecedores
}

export type FornecedoresCreateRequestBody = {
    name: string;
    cnpj?: string;
    razaoSocial?: string;
    endereco?: string;
    email?: string;
    telefone?: string;
    observacoes?: string;
}

export type FornecedoresUpdateRequest = {
    id: string;
} & FornecedoresCreateRequestBody
