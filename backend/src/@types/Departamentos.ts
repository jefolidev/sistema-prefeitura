export type DepartamentosCreateRequestBody = {
    name: string;
    responsavel: string;
    cpf?: string;
}

export type DepartamentosUpdateQuery = {
    id: string;
}
