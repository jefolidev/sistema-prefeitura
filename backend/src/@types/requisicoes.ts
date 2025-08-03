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
    shouldShowValuesSpentedByGroups: z.boolean().optional(),
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

