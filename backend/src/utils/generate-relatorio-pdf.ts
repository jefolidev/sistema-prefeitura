import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";


export const generateRelatorioPdf = async (relatorio: RelatorioData): Promise<Buffer> => {
    const htmlPath = path.resolve("src/relatorio.html");
    let html = fs.readFileSync(htmlPath, "utf-8");

    const format = (v: number) => v.toLocaleString("pt-br", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const total = relatorio.itens.reduce((acc, i) => acc + i.quantity * i.valor, 0);

    const rows = Array.from({ length: 9 }).map((_, idx) => {
        const item = relatorio.itens[idx];
        if (!item) return "<tr><td></td><td></td><td></td><td></td><td></td></tr>";
        return `<tr>
            <td>${item.quantity.toLocaleString("pt-br", {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${item.produto.unidadeMedida}</td>
            <td>${item.produto.name}</td>
            <td>R$ ${format(item.valor)}</td>
            <td>R$ ${format(item.valor * item.quantity)}</td>
        </tr>`;
    }).join("\n");

    const blockRegex = /(\s*<tr>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<td><\/td>\s*<\/tr>\s*){9}/;
    html = html.replace(blockRegex, rows).replace(blockRegex, rows);

    html = html.replace(/\$\{\{ID_SEQUENCIAL\}\}/g, String(relatorio.seq).padStart(7, "0"));
    html = html.replace(/\$\{\{FORNECEDOR\}\}/g, relatorio.fornecedor.name);
    html = html.replace(/\$\{\{CRIADOR\}\}/g, relatorio.user.name);
    html = html.replace(/\$\{\{AUTORIZADO_POR\}\}/g, relatorio.creator?.name ?? "Desconhecido");
    html = html.replace(/\$\{\{RETIRANTE\}\}/g, relatorio.nameRetirante ?? "");
    html = html.replace(/\$\{\{OBSERVACOES\}\}/g, relatorio.observacao ?? "(Sem observações)");
    html = html.replace(/\$\{\{VALOT_TOTAL\}\}/g, "R$ "+format(total));
    html = html.replace(/\$\{\{DATA\/HORA\}\}/g, relatorio.createdAt.toLocaleString("pt-BR"));

    const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const buffer = await page.pdf({ format: "A4", scale: 0.85 });
    await browser.close();
    return buffer;
};
