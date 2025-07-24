import ResponseApiDefault from "./ResponseApiDefault";

export type RelatorioItemInput = {
    produtoId: string;
    quantity: number;
};

export type RelatorioCreateRequestBody = {
    fornecedorId: string;
    userId: string;
    departamentoId: string;
    nameRetirante: string;
    itens: RelatorioItemInput[];
    observacoes?: string;
};

export interface Relatorio {
  id: string;
  fornecedorId: string;
  userId: string;
  departamentoId: string;
  departamento?: { id: string; name: string };
  seq: number;
  nameRetirante: string | null;
  observacao: string | null;
  isCanceled: boolean;
  createdAt: string; // ou Date se você converter para objeto Date
  updatedAt: string;
  fornecedor: Fornecedor;
  user: User;
  userRetirante?: User;
  itens: Item[];
}

interface Fornecedor {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

interface Item {
  id: string;
  relatorioId: string;
  produtoId: string;
  quantity: number;
  valor: number;
  createdAt: string; // ou Date
  updatedAt: string; // ou Date
  produto: Produto;
}

interface Produto {
  id: string;
  name: string;
}

export interface RelatoriosGetResponse extends ResponseApiDefault {
    data: Relatorio[];
}

export interface RelatorioGetByIdResponse extends ResponseApiDefault {
    data?: Relatorio & { itens: RelatorioItemInput[] };
}
