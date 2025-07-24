import ResponseApiDefault from "./ResponseApiDefault";

export type Produtos = {
    id: string;
    name: string;
    description?: string;
    unidadeMedida: string;
    valor: number;
    grupoId: string;
    grupo?: {
        id: string;
        name: string;
    };
    fornecedorId: string;
    departamentoId?: string;
    createdAt: string;
    updatedAt: string;
}
export interface ProdutosGetResponse extends ResponseApiDefault{
    data: Produtos[]
}

export interface ProdutosGetByIdResponse extends ResponseApiDefault {
    data?: Produtos
}

export type ProdutosCreateRequestBody = {
    name: string;
    description?: string;
    unidadeMedida: string;
    valor: number;
    grupoId: string;
    fornecedorId: string;
    departamentoId?: string;
}

export type ProdutosUpdateRequest = {
    id: string;
} & ProdutosCreateRequestBody
