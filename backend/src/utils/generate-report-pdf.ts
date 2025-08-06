import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

export interface RelatorioData {
  seq?: number;
  fornecedores?: { name: string; total: number }[];
  user: { name: string };
  creator: { name: string } | null;
  itens: {
    quantity: number;
    valor: number;
    produto: {
      name: string;
      unidadeMedida: string;
    };
  }[];
  nameRetirante?: string;
  observacoes?: string;
  createdAt: Date;
}

export const generateRelatorioReportPdf = async (
  relatorio: RelatorioData
): Promise<Buffer> => {
  const htmlPath = path.resolve("src/relatorio-dinamico.html");
  let html = fs.readFileSync(htmlPath, "utf-8");

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Monta as 9 linhas da tabela
  const rows = Array.from({ length: 9 })
    .map((_, idx) => {
      const item = relatorio.itens[idx];
      if (!item)
        return `<tr><td></td><td></td><td></td><td></td><td></td></tr>`;
      return `<tr>
        <td>${item.quantity.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}</td>
        <td>${item.produto.unidadeMedida}</td>
        <td>${item.produto.name}</td>
        <td>${formatCurrency(item.valor)}</td>
        <td>${formatCurrency(item.valor * item.quantity)}</td>
      </tr>`;
    })
    .join("\n");

  const total = relatorio.itens.reduce(
    (acc, i) => acc + i.quantity * i.valor,
    0
  );

  // Substitui placeholders simples
  html = html.replace(/\$\{\{ID_SEQUENCIAL\}\}/g, String(relatorio.seq ?? "").padStart(7, "0"));
  html = html.replace(
    /\$\{\{FORNECEDOR\}\}/g,
    relatorio.fornecedores?.[0]?.name ?? "Desconhecido"
  );
  html = html.replace(
    /\$\{\{AUTORIZADO_POR\}\}/g,
    relatorio.creator?.name ?? "Desconhecido"
  );
  html = html.replace(/\$\{\{CRIADOR\}\}/g, relatorio.user.name);
  html = html.replace(/\$\{\{RETIRANTE\}\}/g, relatorio.nameRetirante ?? "");
  html = html.replace(/\$\{\{OBSERVACOES\}\}/g, relatorio.observacoes ?? "(Sem observações)");
  html = html.replace(
    /\$\{\{DATA\/HORA\}\}/g,
    relatorio.createdAt.toLocaleString("pt-BR")
  );
  html = html.replace(/\$\{\{VALOT_TOTAL\}\}/g, formatCurrency(total));

  // Substituir 9 linhas vazias por linhas com dados
  const emptyRowsRegex = /(<tr>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<\/tr>\s*){9}/m;
  html = html.replace(emptyRowsRegex, rows);

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
