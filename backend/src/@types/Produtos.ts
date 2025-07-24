export type ProdutosCreateRequestBody = {
    name: string;
    description?: string;
    quantity?: number;
    fornecedorId: string;
    departamentoId?: string;
    unidadeMedida: string;
    valor: number;
    grupoId: string;
};

export type ProdutosUpdateQuery = {
    id: string;
};
