import fs from "fs";
import { generateRelatorioReportPdf } from "./utils/generate-report-pdf";

async function main() {
  const relatorioFake = {
    seq: 1,
    fornecedores: [{ name: "Fornecedor Teste", total: 200 }],
    user: { name: "Usuário Teste" },
    creator: { id: "123", name: "Criador Teste" },
    nameRetirante: "Fulano",
    observacao: "Observação qualquer",
    itens: [
      {
        quantity: 5,
        valor: 10,
        produto: {
          name: "Produto 1",
          unidadeMedida: "UN",
          valor: 10,
          grupo: { name: "Grupo A" },
        },
      },
    ],
    createdAt: new Date(),

    // Ativa os blocos que você quiser testar

    showByGroup: true,
    showByDepartment: true,
    showByProvider: true,
    showRequisitionByProviders: true,
    showHowMuchEachDepartmentSpentWithEachProvider: true,
    showDetailedItemsByEachGroup: true,

    byGroup: [
      { groupId: "g1", name: "Grupo A", total: 50 },
    ],
    byDepartment: [
      { departmentId: "d1", name: "Departamento A", total: 500 }
    ],
    byProvider: [
      { providerId: "p1", name: "Forncedor A", total: 500 }
    ],

    shouldShowRequisitionByProviders: [
      {
        fornecedor: "Fornecedor Teste",
        requisicoes: [
          {
            id: "1",
            department: "Financeiro",
            date: "2025-08-05",
            product: {
              id: "p1",
              relatorioId: "r1",
              produtoId: "prod1",
              quantity: 2,
              valor: 20,
              createdAt: "2025-08-01",
              updatedAt: "2025-08-01",
              produto: {
                name: "Produto 1"
              }
            },
            unitPrice: 20,
            total: 40,
          },
        ]
      }
    ],

    shouldShowAllExpensesByProviderInPeriod: [
      {
        providerId: "c55f450e-5562-436b-8168-4ce61f6ce4e2",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-08-31T23:59:59.000Z",
        total: 261,
      },
      {
        providerId: "7629378a-f226-44c2-8e6a-0471093438eb",
        startDate: "2025-07-01T00:00:00.000Z",
        endDate: "2025-08-31T23:59:59.000Z",
        total: 69.9,
      }
    ],

    shouldShowDetailedItemsByEachGroup: {
      "Grupo A": [
        {
          produto: "Produto 1",
          unitPrice: 10,
        },
      ],
    },

    shouldShowHowMuchEachDepartmentSpentWithEachProvider: [
      {
        departmentId: "Financeiro",
        providerId: "Fornecedor Teste",
        total: 123.45,
      },
    ],

    shouldShowHowHasBeenSpentedByGroupInDepartments: {
      Financeiro: {
        "Grupo A": 300,
        "Grupo B": 150,
      }
    }
  };

  const pdfBuffer = await generateRelatorioReportPdf(relatorioFake as any);

  fs.writeFileSync("relatorio-gerado.pdf", pdfBuffer);
  console.log("🎉 PDF gerado com sucesso!");
}

main();
