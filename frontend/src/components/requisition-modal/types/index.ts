import z from "zod";

export interface ExportRequisitionModalProps {
    visible: boolean;
    onClose: () => void;
    // onExport: (startDate: string, endDate: string, reportModel: string) => void;
    title?: string;
}

export const generateReportRequestSchema = z.object({
    startDate: z.coerce.date({ error: "Data inicial é obrigatória" }),
    endDate: z.coerce.date({ error: "Data final é obrigatória" }),
    isProviders: z.boolean().optional,
    isGroups: z.boolean().optional,
    isDepartments: z.boolean().optional,
    shouldShowRequisitionByProviders: z.boolean().optional,
    shouldShowAllExpensesByProviderInPeriod: z.boolean().optional,
    shouldShowHowMuchEachDepartmentSpentWithEachProvider: z.boolean().optional,
    shouldShowHowHasBeenSpentedByGroupInDepartments: z.boolean().optional,
    shouldShowValuesSpentedByGroups: z.boolean().optional,
    shouldShowDetailedItemsByEachGroup: z.boolean().optional,
});

export type GenerateRepostRequest = z.infer<typeof generateReportRequestSchema>

export type GroupKeys = "startDate" |
    "endDate" |
    "isProviders" |
    "isGroups" |
    "isDepartments" |
    "shouldShowRequisitionByProviders" |
    "shouldShowAllExpensesByProviderInPeriod" |
    "shouldShowHowMuchEachDepartmentSpentWithEachProvider" |
    "shouldShowHowHasBeenSpentedByGroupInDepartments" |
    "shouldShowValuesSpentedByGroups" |
    "shouldShowDetailedItemsByEachGroup"