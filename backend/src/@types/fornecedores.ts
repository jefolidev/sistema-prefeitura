export type FornecedoresCreateRequestBody = {
    name: string;
    cnpj?: string;
    razaoSocial?: string;
    endereco?: string;
    email?: string;
    telefone?: string;
    observacoes?: string;
}

export type FornecedoresUpdateQuery = {
    id: string;
}