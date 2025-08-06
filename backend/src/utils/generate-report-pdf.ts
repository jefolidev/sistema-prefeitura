import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export interface RelatorioData {
  fornecedores: { name: string; total: number }[];
  user: { name: string };
  creator: { name: string } | null;
  itens: {
    quantity: number;
    valor: number;
    produto: {
      name: string;
      unidadeMedida: string;
      valor: number;
      grupo?: { name: string };
    };
  }[];
  createdAt: Date;

  byGroup?: { groupId: string; name: string; total: number }[];
  byDepartment?: { departamentoId: string; name: string; total: number }[];
  byProvider?: { providerId: string; name: string; total: number }[];

  shouldShowRequisitionByProviders?: {
    fornecedor: string;
    requisicoes: {
      id: string;
      department: string;
      date: Date;
      product: {
        produto: { name: string };
        quantity: number;
      };
      unitPrice: number;
      total: number;
    }[];
  }[];

  shouldShowAllExpensesByProviderInPeriod?: {
    providerId: string;
    startDate: Date | string;
    endDate: Date | string;
    total: number;
  }[];

  shouldShowHowMuchEachDepartmentSpentWithEachProvider?: {
    departmentId: string;
    departmentName: string;
    providerId: string;
    providerName: string;
    total: number;
  }[];

  shouldShowHowHasBeenSpentedByGroupInDepartments?: Record<string, Record<string, number>>;

  shouldShowDetailedItemsByEachGroup?: Record<
    string,
    {
      produto: string;
      unitPrice: number;
    }[]
  >;

  // Flags para mostrar blocos no PDF
  showByGroup?: boolean;
  showByDepartment?: boolean;
  showByProvider?: boolean;
  showRequisitionByProviders?: boolean;
  showHowMuchEachDepartmentSpentWithEachProvider?: boolean;
  showDetailedItemsByEachGroup?: boolean;
}

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// function replaceSection(html: string, startTag: string, endTag: string, replacement: string): string {
//   const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, "g");
//   return html.replace(regex, replacement || "");
// }

export const generateRelatorioReportPdf = async (relatorio: RelatorioData): Promise<Buffer> => {
  const htmlPath = path.resolve("src/relatorio-dinamico.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  html = html.replace("{{CRIADOR}}", relatorio.user.name);
  html = html.replace("{{DATA_HORA}}", relatorio.createdAt.toLocaleString("pt-BR"));

  // Resumo por Fornecedor
  const resumoFornecedores = relatorio.fornecedores?.length
    ? `
      <h3>Resumo por Fornecedor</h3>
      <table class="table-break" border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Nome do Fornecedor</th><th>Total</th></tr></thead>
        <tbody>
          ${relatorio.fornecedores
      .map(f => `<tr><td>${f.name}</td><td>${formatCurrency(f.total)}</td></tr>`)
      .join("")}
        </tbody>
      </table><hr>`
    : "";

  html = html.replace("{{RESUMO_FORNECEDORES}}", resumoFornecedores);

  // Resumo por Departamento
  const resumoDepartamentos = relatorio.byDepartment?.length
    ? `
      <h3>Resumo por Departamento</h3>
      <table class="table-break" border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Nome do Departamento</th><th>Total</th></tr></thead>
        <tbody>
          ${relatorio.byDepartment
      .map(d => `<tr><td>${d.name}</td><td>${formatCurrency(d.total)}</td></tr>`)
      .join("")}
        </tbody>
      </table><hr>`
    : "";

  html = html.replace("{{RESUMO_DEPARTAMENTOS}}", resumoDepartamentos);

  // Resumo por Grupo
  const resumoGrupos = relatorio.byGroup?.length
    ? `
      <h3>Resumo por Grupo</h3>
      <table class="table-break" border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Nome do Grupo</th><th>Total</th></tr></thead>
        <tbody>
          ${relatorio.byGroup
      .map(g => `<tr><td>${g.name}</td><td>${formatCurrency(g.total)}</td></tr>`)
      .join("")}
        </tbody>
      </table><hr>`
    : "";

  html = html.replace("{{RESUMO_GRUPOS}}", resumoGrupos);

  // Requisições por Fornecedor
  const requisicoesHtml =
    relatorio.showRequisitionByProviders &&
      relatorio.shouldShowRequisitionByProviders?.length
      ? `
      <h3>Requisições por Fornecedor</h3>
      ${relatorio.shouldShowRequisitionByProviders
        .map(provider => {
          const rows = provider.requisicoes
            .map(req => `<tr>
              <td>${req.department}</td>
              <td>${new Date(req.date).toLocaleDateString("pt-BR")}</td>
              <td>${req.product.produto.name}</td>
              <td>${req.product.quantity}</td>
              <td>${formatCurrency(req.unitPrice)}</td>
              <td>${formatCurrency(req.total)}</td>
            </tr>`)
            .join("");
          return `
          <table class="table-break" border="1" cellpadding="4" cellspacing="0" style="margin-bottom: 20px;">
            <thead>
              <tr><td colspan="6"><strong>Fornecedor: ${provider.fornecedor}</strong></td></tr>
              <tr><th>Departamento</th><th>Data</th><th>Produto</th><th>Qtd</th><th>Preço Unit</th><th>Total</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>`;
        })
        .join("")}
      <hr>`
      : "";

  html = html.replace("{{REQUISICOES_POR_FORNECEDOR}}", requisicoesHtml);

  // Gastos de Departamento por Fornecedor
  const gastosDepPorFornecedor =
    relatorio.showHowMuchEachDepartmentSpentWithEachProvider &&
      relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider?.length
      ? `
      <h3>Gastos Departamento x Fornecedor</h3>
      <table class="table-break" border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Departamento</th><th>Fornecedor</th><th>Total</th></tr></thead>
        <tbody>
          ${relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider
        .map(
          d => `<tr><td>${d.departmentName}</td><td>${d.providerName}</td><td>${formatCurrency(d.total)}</td></tr>`
        )
        .join("")}
        </tbody>
      </table><hr>`
      : "";

  html = html.replace("{{GASTOS_DEPARTAMENTO_FORNECEDOR}}", gastosDepPorFornecedor);

  // Gastos por Grupo em Departamentos
  const gruposPorDepartamento = relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments
    ? `
      <h3>Gastos por Grupo nos Departamentos</h3>
      ${Object.entries(relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments)
      .map(([dep, groups]) => {
        const rows = Object.entries(groups)
          .map(([group, total]) => `<tr><td>${group}</td><td>${formatCurrency(total)}</td></tr>`)
          .join("");
        return `
          <h4>${dep}</h4>
          <table class="table-break" border="1" cellpadding="4" cellspacing="0">
            <thead><tr><th>Grupo</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join("")}
      <hr>`
    : "";

  html = html.replace("{{GASTOS_GRUPO_POR_DEPARTAMENTO}}", gruposPorDepartamento);

  // Produtos por Grupo
  const produtosPorGrupo =
    relatorio.showDetailedItemsByEachGroup && relatorio.shouldShowDetailedItemsByEachGroup
      ? `
      <h3>Produtos por Grupo</h3>
      ${Object.entries(relatorio.shouldShowDetailedItemsByEachGroup)
        .map(([groupName, items]) => {
          const rows = items
            .map(i => `<tr><td>${i.produto}</td><td>${formatCurrency(i.unitPrice)}</td></tr>`)
            .join("");
          return `
          <table class="table-break" border="0"><tr><td colspan="2"><strong>${groupName}</strong></td></tr></table>
          <table class="table-break" border="1" cellpadding="4" cellspacing="0">
            <thead><tr><th>Produto</th><th>Valor</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
        })
        .join("")}
      <hr>`
      : "";

  html = html.replace("{{PRODUTOS_POR_GRUPO}}", produtosPorGrupo);

  // Puppeteer
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });
  const buffer = await page.pdf({ format: "A4", scale: 0.85 });
  await browser.close();

  return buffer;
};

// export const generateRelatorioReportPdf = async (relatorio: RelatorioData): Promise<Buffer> => {
//   const htmlPath = path.resolve("src/relatorio-dinamico.html");
//   let html = fs.readFileSync(htmlPath, "utf-8");

//   // Substituições fixas
//   html = html.replace(/\$\{\{CRIADOR\}\}/g, relatorio.user.name);
//   html = html.replace(/\$\{\{DATA_HORA\}\}/g, relatorio.createdAt.toLocaleString("pt-BR"));

//   // 1. Resumo por Fornecedor
//   if (relatorio.fornecedores && relatorio.fornecedores.length) {
//     const rows = relatorio.fornecedores
//       .map(p => `<tr><td>${p.name}</td><td>${formatCurrency(p.total)}</td></tr>`)
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_SUMMARY_BY_PROVIDER -->",
//       "<!-- END_SUMMARY_BY_PROVIDER -->",
//       `
// <h3>Resumo por Fornecedor</h3>
// <table border="1" cellpadding="4" cellspacing="0">
//   <thead><tr><th>Nome do Fornecedor</th><th>Total</th></tr></thead>
//   <tbody>${rows}</tbody>
// </table>
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_SUMMARY_BY_PROVIDER -->", "<!-- END_SUMMARY_BY_PROVIDER -->", "");
//   }

//   // 2. Resumo por Departamento
//   if (relatorio.byDepartment && relatorio.byDepartment.length) {
//     const rows = relatorio.byDepartment
//       .map(d => `<tr><td>${d.name}</td><td>${formatCurrency(d.total)}</td></tr>`)
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_SUMMARY_BY_DEPARTMENT -->",
//       "<!-- END_SUMMARY_BY_DEPARTMENT -->",
//       `
// <h3>Resumo por Departamento</h3>
// <table border="1" cellpadding="4" cellspacing="0">
//   <thead><tr><th>Nome do Departamento</th><th>Total</th></tr></thead>
//   <tbody>${rows}</tbody>
// </table>
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_SUMMARY_BY_DEPARTMENT -->", "<!-- END_SUMMARY_BY_DEPARTMENT -->", "");
//   }

//   // 3. Resumo por Grupo
//   if (relatorio.byGroup && relatorio.byGroup.length) {
//     const rows = relatorio.byGroup
//       .map(g => `<tr><td>${g.name}</td><td>${formatCurrency(g.total)}</td></tr>`)
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_SUMMARY_BY_GROUP -->",
//       "<!-- END_SUMMARY_BY_GROUP -->",
//       `
// <h3>Resumo por Grupo</h3>
// <table border="1" cellpadding="4" cellspacing="0">
//   <thead><tr><th>Nome do Grupo</th><th>Total</th></tr></thead>
//   <tbody>${rows}</tbody>
// </table>
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_SUMMARY_BY_GROUP -->", "<!-- END_SUMMARY_BY_GROUP -->", "");
//   }

//   // 4. Requisições feitas por provedores
//   if (
//     relatorio.showRequisitionByProviders &&
//     relatorio.shouldShowRequisitionByProviders &&
//     relatorio.shouldShowRequisitionByProviders.length
//   ) {
//     const requisicoesHtml = relatorio.shouldShowRequisitionByProviders
//       .map(providerBlock => {
//         const requisicoesRows = providerBlock.requisicoes
//           .map(
//             req => `<tr>
//     <td>${req.department}</td>
//     <td>${new Date(req.date).toLocaleDateString("pt-BR")}</td>
//     <td>${req.product.produto.name}</td>
//     <td>${req.product.quantity}</td>
//     <td>${formatCurrency(req.unitPrice)}</td>
//     <td>${formatCurrency(req.total)}</td>
//   </tr>`
//           )
//           .join("\n");

//         return `
// <table border="1" cellpadding="4" cellspacing="0" style="margin-bottom: 20px;">
//   <thead>
//     <tr><td colspan="6"><strong>Fornecedor: ${providerBlock.fornecedor}</strong></td></tr>
//     <tr>
//       <th>Departamento</th><th>Data</th><th>Produto</th><th>Quantidade</th><th>Preço Unitário</th><th>Total</th>
//     </tr>
//   </thead>
//   <tbody>${requisicoesRows}</tbody>
// </table>
//         `;
//       })
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_REQUISITIONS_BY_PROVIDER -->",
//       "<!-- END_REQUISITIONS_BY_PROVIDER -->",
//       `
// <h3>Requisições Feitas por Distribuidores</h3>
// ${requisicoesHtml}
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_REQUISITIONS_BY_PROVIDER -->", "<!-- END_REQUISITIONS_BY_PROVIDER -->", "");
//   }

//   // 6. Gastos de Departamento por Fornecedor
//   if (
//     relatorio.showHowMuchEachDepartmentSpentWithEachProvider &&
//     relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider &&
//     relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider.length
//   ) {
//     const rows = relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider
//       .map(
//         item => `<tr>
//     <td>${item.departmentName}</td>
//     <td>${item.providerName}</td>
//     <td>${formatCurrency(item.total)}</td>
//   </tr>`
//       )
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_EXPENSES_DEPARTMENT_BY_PROVIDER -->",
//       "<!-- END_EXPENSES_DEPARTMENT_BY_PROVIDER -->",
//       `
// <h3>Gastos de Departamento por Fornecedor</h3>
// <table border="1" cellpadding="4" cellspacing="0">
//   <thead><tr><th>Departamento</th><th>Fornecedor</th><th>Total Gasto</th></tr></thead>
//   <tbody>${rows}</tbody>
// </table>
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_EXPENSES_DEPARTMENT_BY_PROVIDER -->", "<!-- END_EXPENSES_DEPARTMENT_BY_PROVIDER -->", "");
//   }

//   // 7. Gastos por Grupos de Departamentos
//   if (relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments) {
//     const groupsInDepartmentsHtml = Object.entries(relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments)
//       .map(([dept, groups]) => {
//         const rows = Object.entries(groups)
//           .map(([groupName, total]) => `<tr><td>${groupName}</td><td>${formatCurrency(total)}</td></tr>`)
//           .join("\n");
//         return `
// <h4>Departamento: ${dept}</h4>
// <table border="1" cellpadding="4" cellspacing="0" style="margin-bottom: 20px;">
//   <thead><tr><th>Grupo</th><th>Total</th></tr></thead>
//   <tbody>${rows}</tbody>
// </table>
//         `;
//       })
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_EXPENSES_GROUPS_BY_DEPARTMENT -->",
//       "<!-- END_EXPENSES_GROUPS_BY_DEPARTMENT -->",
//       `
// <h3>Gastos por Grupos de Departamentos</h3>
// ${groupsInDepartmentsHtml}
// <hr style="margin: 30px 0; border: none; border-top: 1px solid #ccc;">
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_EXPENSES_GROUPS_BY_DEPARTMENT -->", "<!-- END_EXPENSES_GROUPS_BY_DEPARTMENT -->", "");
//   }

//   // 8. Produtos por Grupo
//   if (relatorio.showDetailedItemsByEachGroup && relatorio.shouldShowDetailedItemsByEachGroup) {
//     const groupsHtml = Object.entries(relatorio.shouldShowDetailedItemsByEachGroup)
//       .map(([groupName, items]) => {
//         const itemsHtml = items
//           .map(i => `<tr><td>${i.produto}</td><td>${formatCurrency(i.unitPrice)}</td></tr>`)
//           .join("\n");
//         return `
// <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 5px;">
//   <tr><td colspan="2"><strong>${groupName}</strong></td></tr>
// </table>
// <table border="1" cellpadding="4" cellspacing="0" style="margin-bottom: 20px;">
//   <thead><tr><th>Nome do Produto</th><th>Valor Unitário</th></tr></thead>
//   <tbody>${itemsHtml}</tbody>
// </table>
// <hr style="margin: 15px 0; border: none; border-top: 1px solid #ccc;">
//         `;
//       })
//       .join("\n");

//     html = replaceSection(
//       html,
//       "<!-- START_PRODUCTS_BY_GROUP -->",
//       "<!-- END_PRODUCTS_BY_GROUP -->",
//       `
// <h3>Produtos por Grupo</h3>
// ${groupsHtml}
//     `
//     );
//   } else {
//     html = replaceSection(html, "<!-- START_PRODUCTS_BY_GROUP -->", "<!-- END_PRODUCTS_BY_GROUP -->", "");
//   }

//   // Gerar PDF com puppeteer
//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });
//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: "load" });
//   const buffer = await page.pdf({ format: "A4", scale: 0.85 });
//   await browser.close();

//   return buffer;
// };
