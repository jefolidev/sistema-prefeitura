import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export interface RelatorioData {
  seq: number;
  fornecedores: { name: string; total: number }[]
  user: { name: string };
  creator: { id: string; name: string } | null;
  nameRetirante: string | null;
  observacao: string | null;
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
      date: string; // ISO ou string que vira date
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
    providerId: string;
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

function replaceSection(html: string, startTag: string, endTag: string, replacement: string): string {
  const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, "g");
  return html.replace(regex, replacement || "");
}

export const generateRelatorioReportPdf = async (relatorio: RelatorioData): Promise<Buffer> => {
  const htmlPath = path.resolve("src/relatorio-dinamico.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  // Substituições fixas
  html = html.replace(/\$\{\{CRIADOR\}\}/g, relatorio.user.name);
  html = html.replace(/\$\{\{DATA_HORA\}\}/g, relatorio.createdAt.toLocaleString("pt-BR"));

  // 1. Resumo por Fornecedor
  if (relatorio.fornecedores) {
    const rows = relatorio.fornecedores.map(p => `<tr><td>${p.name}</td><td>${formatCurrency(p.total)}</td></tr>`)
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_SUMMARY_BY_PROVIDER -->",
      "<!-- END_SUMMARY_BY_PROVIDER -->",
      `<table><thead><tr><th>Nome do Fornecedor</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_SUMMARY_BY_PROVIDER -->", "<!-- END_SUMMARY_BY_PROVIDER -->", "");
  }

  // 2. Resumo por Departamento
  if (relatorio.byDepartment && relatorio.byDepartment.length) {
    const rows = relatorio.byDepartment
      .map(d => `<tr><td>${d.name}</td><td>${formatCurrency(d.total)}</td></tr>`)
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_SUMMARY_BY_DEPARTMENT -->",
      "<!-- END_SUMMARY_BY_DEPARTMENT -->",
      `<table><thead><tr><th>Nome do Departamento</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_SUMMARY_BY_DEPARTMENT -->", "<!-- END_SUMMARY_BY_DEPARTMENT -->", "");
  }

  // 3. Resumo por Grupo
  if (relatorio.byGroup && relatorio.byGroup.length) {
    const rows = relatorio.byGroup
      .map(g => `<tr><td>${g.name}</td><td>${formatCurrency(g.total)}</td></tr>`)
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_SUMMARY_BY_GROUP -->",
      "<!-- END_SUMMARY_BY_GROUP -->",
      `<table><thead><tr><th>Nome do Grupo</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_SUMMARY_BY_GROUP -->", "<!-- END_SUMMARY_BY_GROUP -->", "");
  }

  // 4. Requisições feitas por provedores
  if (relatorio.showRequisitionByProviders
    && relatorio.shouldShowRequisitionByProviders
    && relatorio.shouldShowRequisitionByProviders.length) {
    const requisicoesHtml = relatorio.shouldShowRequisitionByProviders
      .map(providerBlock => {
        const requisicoesRows = providerBlock.requisicoes
          .map(req => `<tr>
            <td>${req.department}</td>
            <td>${new Date(req.date).toLocaleDateString("pt-BR")}</td>
            <td>${req.product.produto.name}</td>
            <td>${req.product.quantity}</td>
            <td>${formatCurrency(req.unitPrice)}</td>
            <td>${formatCurrency(req.total)}</td>
          </tr>`)
          .join("\n");

        return `<h3>Fornecedor: ${providerBlock.fornecedor}</h3>
          <table border="1" cellpadding="4" cellspacing="0">
            <thead>
              <tr>
                <th>Departamento</th><th>Data</th><th>Produto</th><th>Quantidade</th><th>Preço Unitário</th><th>Total</th>
              </tr>
            </thead>
            <tbody>${requisicoesRows}</tbody>
          </table>`;
      }).join("\n");

    html = replaceSection(html, "<!-- START_REQUISITIONS_BY_PROVIDER -->", "<!-- END_REQUISITIONS_BY_PROVIDER -->", requisicoesHtml);
  } else {
    html = replaceSection(html, "<!-- START_REQUISITIONS_BY_PROVIDER -->", "<!-- END_REQUISITIONS_BY_PROVIDER -->", "");
  }

  // 6. Gastos de Departamento por Fornecedor
  if (relatorio.showHowMuchEachDepartmentSpentWithEachProvider
    && relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider
    && relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider.length) {
    const rows = relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider
      .map(item => `<tr>
        <td>${item.departmentId}</td>
        <td>${item.providerId}</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>`)
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_EXPENSES_DEPARTMENT_BY_PROVIDER -->",
      "<!-- END_EXPENSES_DEPARTMENT_BY_PROVIDER -->",
      `<table border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Departamento</th><th>Fornecedor</th><th>Total Gasto</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_EXPENSES_DEPARTMENT_BY_PROVIDER -->", "<!-- END_EXPENSES_DEPARTMENT_BY_PROVIDER -->", "");
  }

  // 7. Gastos por Grupos de Departamentos
  if (relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments) {
    const groupsInDepartmentsHtml = Object.entries(relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments)
      .map(([dept, groups]) => {
        const rows = Object.entries(groups)
          .map(([groupName, total]) => `<tr><td>${groupName}</td><td>${formatCurrency(total)}</td></tr>`)
          .join("\n");
        return `<h4>Departamento: ${dept}</h4>
          <table border="1" cellpadding="4" cellspacing="0">
            <thead><tr><th>Grupo</th><th>Total</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      })
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_EXPENSES_GROUPS_BY_DEPARTMENT -->",
      "<!-- END_EXPENSES_GROUPS_BY_DEPARTMENT -->",
      groupsInDepartmentsHtml
    );
  } else {
    html = replaceSection(html, "<!-- START_EXPENSES_GROUPS_BY_DEPARTMENT -->", "<!-- END_EXPENSES_GROUPS_BY_DEPARTMENT -->", "");
  }

  // 8. Produtos por Grupo
  if (relatorio.showDetailedItemsByEachGroup && relatorio.shouldShowDetailedItemsByEachGroup) {
    const groupsHtml = Object.entries(relatorio.shouldShowDetailedItemsByEachGroup)
      .map(([groupName, items]) => {
        const itemsHtml = items
          .map(i => `<tr><td>${i.produto}</td><td>${formatCurrency(i.unitPrice)}</td></tr>`)
          .join("\n");
        return `<h3>${groupName}</h3>
          <table border="1" cellpadding="4" cellspacing="0">
            <thead><tr><th>Nome do Produto</th><th>Valor Unitário</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>`;
      })
      .join("\n");

    html = replaceSection(html, "<!-- START_PRODUCTS_BY_GROUP -->", "<!-- END_PRODUCTS_BY_GROUP -->", groupsHtml);
  } else {
    html = replaceSection(html, "<!-- START_PRODUCTS_BY_GROUP -->", "<!-- END_PRODUCTS_BY_GROUP -->", "");
  }

  // Gerar PDF com puppeteer
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
