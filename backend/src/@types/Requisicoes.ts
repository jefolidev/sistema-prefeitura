export type RequisicaoItemInput = {
    produtoId: string;
    quantity: number;
};

export type RequisicaoCreateRequestBody = {
    fornecedorId: string;
    departamentoId?: string;
    userId: string;
    nameRetirante: string;
    observacoes?: string;
    itens: RequisicaoItemInput[];
};

export type RequisicaoCancelQuery = {
    id: string;
};

export type RequisicaoQuery = { id: string; };
