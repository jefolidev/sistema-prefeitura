import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { DetailedItemsByEachGroup, ShouldShowRequisitionByProviders } from "../@types/requisicoes";

export type RelatorioData = {
  seq: number;
  fornecedor: { name: string };
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

  shouldShowRequisitionByProviders?: ShouldShowRequisitionByProviders

  shouldShowHowMuchEachDepartmentSpentWithEachProvider?: {
    departmentId: string;
    providerId: string;
    total: number;
  }[];

  shouldShowHowHasBeenSpentedByGroupInDepartments?: Record<string, Record<string, number>>;

  shouldShowDetailedItemsByEachGroup?: DetailedItemsByEachGroup;

  // Flags to toggle blocks
  showByGroup?: boolean;
  showByDepartment?: boolean;
  showByProvider?: boolean;
  showRequisitionByProviders?: boolean;
  showHowMuchEachDepartmentSpentWithEachProvider?: boolean;
  showDetailedItemsByEachGroup?: boolean;
};

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function replaceSection(
  html: string,
  startTag: string,
  endTag: string,
  replacement: string
): string {
  const regex = new RegExp(`${startTag}[\\s\\S]*?${endTag}`, "g");
  return html.replace(regex, replacement || "");
}

export const generateRelatorioPdf = async (
  relatorio: RelatorioData
): Promise<Buffer> => {
  const htmlPath = path.resolve("src/relatorio-dinamico.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  // Substituições fixas
  const total = relatorio.itens.reduce((acc, i) => acc + i.quantity * i.valor, 0);
  html = html.replace(/\$\{\{ID_SEQUENCIAL\}\}/g, String(relatorio.seq).padStart(7, "0"));
  html = html.replace(/\$\{\{FORNECEDOR\}\}/g, relatorio.fornecedor.name);
  html = html.replace(/\$\{\{CRIADOR\}\}/g, relatorio.user.name);
  html = html.replace(/\$\{\{AUTORIZADO_POR\}\}/g, relatorio.creator?.name ?? "Desconhecido");
  html = html.replace(/\$\{\{RETIRANTE\}\}/g, relatorio.nameRetirante ?? "");
  html = html.replace(/\$\{\{OBSERVACOES\}\}/g, relatorio.observacao ?? "(Sem observações)");
  html = html.replace(/\$\{\{VALOR_TOTAL\}\}/g, formatCurrency(total));
  html = html.replace(/\$\{\{DATA_HORA\}\}/g, relatorio.createdAt.toLocaleString("pt-BR"));

  // Itens fixos (exemplo: mostra no máximo 9 itens)
  const rows = Array.from({ length: 9 })
    .map((_, idx) => {
      const item = relatorio.itens[idx];
      if (!item) return "<tr><td></td><td></td><td></td><td></td><td></td></tr>";
      return `<tr>
        <td>${item.quantity.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
        <td>${item.produto.unidadeMedida}</td>
        <td>${item.produto.name}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td>${formatCurrency(item.valor * item.quantity)}</td>
      </tr>`;
    })
    .join("\n");
  html = html.replace(/<!-- START_FIXED_ITEMS -->[\s\S]*?<!-- END_FIXED_ITEMS -->/, rows);

  // 1. Gastos por grupo
  if (relatorio.showByGroup && relatorio.byGroup && relatorio.byGroup.length) {
    const groupRows = relatorio.byGroup
      .map((group) => `<tr><td>${group.name}</td><td>${formatCurrency(group.total)}</td></tr>`)
      .join("\n");
    html = replaceSection(
      html,
      "<!-- START_GROUP_SPENT_BLOCK -->",
      "<!-- END_GROUP_SPENT_BLOCK -->",
      `<table border="1" cellpadding="4" cellspacing="0">
          <thead><tr><th>Grupo</th><th>Valor Gasto</th></tr></thead>
          <tbody>${groupRows}</tbody>
        </table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_GROUP_SPENT_BLOCK -->", "<!-- END_GROUP_SPENT_BLOCK -->", "");
  }

  // 2. Itens detalhados por grupo
  if (relatorio.showDetailedItemsByEachGroup && relatorio.shouldShowDetailedItemsByEachGroup) {
    const groupsHtml = Object.entries(relatorio.shouldShowDetailedItemsByEachGroup)
      .map(([groupName, items]) => {
        const itemsHtml = items
          .map((i) => `<li>${i.produto} - ${formatCurrency(i.unitPrice)}</li>`)
          .join("\n");
        return `<h3>${groupName}</h3><ul>${itemsHtml}</ul>`;
      })
      .join("\n");
    html = replaceSection(html, "<!-- START_DETAILED_ITEMS_BLOCK -->", "<!-- END_DETAILED_ITEMS_BLOCK -->", groupsHtml);
  } else {
    html = replaceSection(html, "<!-- START_DETAILED_ITEMS_BLOCK -->", "<!-- END_DETAILED_ITEMS_BLOCK -->", "");
  }

  // 3. Requisições por fornecedor
  if (relatorio.showRequisitionByProviders && relatorio.shouldShowRequisitionByProviders) {
    const requisicoesHtml = relatorio.shouldShowRequisitionByProviders
      .map((providerBlock) => {
        const itensHtml = providerBlock.requisicoes
          .map(
            (req) => `<tr>
            <td>${req.date}</td>
            <td>${req.department}</td>
            <td>${req.product.produto.name}</td>
            <td>${req.product.quantity}</td>
            <td>${formatCurrency(req.unitPrice)}</td>
            <td>${formatCurrency(req.total)}</td>
          </tr>`
          )
          .join("\n");
        return `<h3>Fornecedor: ${providerBlock.fornecedor}</h3>
          <table border="1" cellpadding="4" cellspacing="0">
            <thead>
              <tr>
                <th>Data</th>
                <th>Departamento</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Preço Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${itensHtml}</tbody>
          </table>`;
      })
      .join("\n");
    html = replaceSection(html, "<!-- START_REQUISITIONS_BY_PROVIDER -->", "<!-- END_REQUISITIONS_BY_PROVIDER -->", requisicoesHtml);
  } else {
    html = replaceSection(html, "<!-- START_REQUISITIONS_BY_PROVIDER -->", "<!-- END_REQUISITIONS_BY_PROVIDER -->", "");
  }

  // 4. Quanto cada departamento gastou com cada fornecedor
  if (
    relatorio.showHowMuchEachDepartmentSpentWithEachProvider &&
    relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider &&
    relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider.length
  ) {
    const rows = relatorio.shouldShowHowMuchEachDepartmentSpentWithEachProvider
      .map(
        (item) => `<tr>
        <td>${item.departmentId}</td>
        <td>${item.providerId}</td>
        <td>${formatCurrency(item.total)}</td>
      </tr>`
      )
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_DEPT_PROVIDER_SPENT -->",
      "<!-- END_DEPT_PROVIDER_SPENT -->",
      `<table border="1" cellpadding="4" cellspacing="0">
        <thead><tr><th>Departamento</th><th>Fornecedor</th><th>Total Gasto</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`
    );
  } else {
    html = replaceSection(html, "<!-- START_DEPT_PROVIDER_SPENT -->", "<!-- END_DEPT_PROVIDER_SPENT -->", "");
  }

  // 5. Gastos por grupo dentro de departamentos
  if (
    relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments
  ) {
    const groupsInDepartmentsHtml = Object.entries(
      relatorio.shouldShowHowHasBeenSpentedByGroupInDepartments
    )
      .map(([dept, groups]) => {
        const rows = Object.entries(groups)
          .map(
            ([groupName, total]) =>
              `<tr><td>${groupName}</td><td>${formatCurrency(total)}</td></tr>`
          )
          .join("\n");
        return `<h4>Departamento: ${dept}</h4><table border="1" cellpadding="4" cellspacing="0"><thead><tr><th>Grupo</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table>`;
      })
      .join("\n");

    html = replaceSection(
      html,
      "<!-- START_GROUP_IN_DEPT_SPENT -->",
      "<!-- END_GROUP_IN_DEPT_SPENT -->",
      groupsInDepartmentsHtml
    );
  } else {
    html = replaceSection(html, "<!-- START_GROUP_IN_DEPT_SPENT -->", "<!-- END_GROUP_IN_DEPT_SPENT -->", "");
  }

  // Tudo pronto, gera o PDF
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
