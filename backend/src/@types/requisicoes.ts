import z from "zod";

export const requisitionGenerateReportBody = z.object({
    startDate: z.coerce.date({ invalid_type_error: "Initial date must be provided." }),
    endDate: z.coerce.date({ invalid_type_error: "Final date must be provided." }),
    isProviders: z.boolean().optional(),
    isGroups: z.boolean().optional(),
    isDepartments: z.boolean().optional(),
    shouldShowRequisitionByProviders: z.boolean().optional(),
    shouldShowAllExpensesByProviderInPeriod: z.boolean().optional(),
    shouldShowHowMuchEachDepartmentSpentWithEachProvider: z.boolean().optional(),
    shouldShowHowHasBeenSpentedByGroupInDepartments: z.boolean().optional(),
    shouldShowDetailedItemsByEachGroup: z.boolean().optional(),
});

export type RequisitionGenerateReportBody = z.infer<typeof requisitionGenerateReportBody>

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

type ReponseByDepartment = { departamentoId: string; departamentoName: string; total: number }[];
type ReponseByGroup = { groupId: string; grupoName: string; total: number }[];
type ReponseByProvider = { providerId: string; providerName: string; total: number }[];

type RequisitionProduct = {
    id: string;
    relatorioId: string;
    produtoId: string;
    quantity: number;
    valor: number;
    createdAt: string;
    updatedAt: string;
    produto: {
        name: string;
    };
};

export type RequisitionItem = {
    id: string;
    department: string;
    date: string;
    product: RequisitionProduct;
    unitPrice: number;
    total: number;
};

type RequisitionByProvider = {
    fornecedor: string;
    requisicoes: RequisitionItem[];
};

export type ShouldShowRequisitionByProviders = RequisitionByProvider[];

type HowMuchEachDepartmentSpentWithEachProviders = {
    departmentId: string;
    departmentName: string;
    providerId: string;
    providerName: string;
    total: number;
}[]

export type DetailedItemsByEachGroup = Record<string, {
    produto: string;
    unitPrice: number;
}[]>

export interface GenerateReportResponse {
    byDepartment: ReponseByDepartment;
    byGroup: ReponseByGroup;
    byProvider: ReponseByProvider;
    shouldShowRequisitionByProviders?: ShouldShowRequisitionByProviders
    shouldShowAllExpensesByProviderInPeriod?: { providerId: string; providerName: string; total: number }[];
    shouldShowHowMuchEachDepartmentSpentWithEachProvider?: HowMuchEachDepartmentSpentWithEachProviders;
    shouldShowHowHasBeenSpentedByGroupInDepartments?: Record<string, Record<string, number>>;
    shouldShowDetailedItemsByEachGroup?: DetailedItemsByEachGroup;
}
