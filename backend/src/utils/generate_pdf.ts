import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

type Produtos = {
    valor: number;
    quantity: number;
    produto: {
        name: string;
        fornecedor: {
            name: string;
        };
        grupo: {
            name: string;
        };
    };
    relatorio: {
        seq: number;
        createdAt: Date;
        creator: {
            name: string;
        };
    };
};

export const generatePdf = async (produtos: Produtos[], message: string, reportModel: string): Promise<Buffer> => {

    const logo1 = fs.readFileSync(path.resolve("src/assets/Logo1SEMED.png")).toString("base64");
    const logo2 = fs.readFileSync(path.resolve("src/assets/Logo2SEMED.png")).toString("base64");

    let thead = ``;
    let colspan = 0;

    switch (reportModel) {
        case "default":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>
            </tr>
        `;
            colspan = 6;
            break;

        case "model1":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Grupo</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>

            </tr>
        `;
            colspan = 7;
            break;

        case "model2":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Data</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>Grupo</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>
            </tr>
        `;
            colspan = 8;
            break;

        case "model3":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Data/Hora</th>
                <th>Descrição</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>
            </tr>
        `;
            colspan = 6;
            break;

        case "model4":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Descrição</th>
                <th>Usuário</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>
            </tr>
        `;
            colspan = 6;
            break;

        case "model5":
            thead = `
            <tr>
                <th>Nº</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>Usuário</th>
                <th>QTDE</th>
                <th>Preço</th>
                <th>Valor Total</th>
            </tr>
        `;
            colspan = 7;
            break;
    }

    
    const rows = produtos.map((p) => {
        const valorTotal = p.valor * p.quantity;
        let values:string[] = [];

        switch (reportModel) {
            case "default":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.produto.name,
                    p.produto.fornecedor.name,
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
            case "model1":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.relatorio.createdAt.toLocaleDateString("pt-br"),
                    p.produto.name,
                    p.produto.grupo.name,
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
            case "model2":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.relatorio.createdAt.toLocaleDateString("pt-br"),
                    p.produto.name,
                    p.produto.fornecedor.name,
                    p.produto.grupo.name,
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
            case "model3":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.relatorio.createdAt.toLocaleString("pt-br"),
                    p.produto.name,
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
            case "model4":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.produto.name,
                    p.relatorio.creator?.name || "(Usuário sem nome)",
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
            case "model5":
                values = [
                    p.relatorio.seq.toString().padStart(7, "0"),
                    p.produto.name,
                    p.produto.fornecedor?.name || "(Fornecedor sem nome)",
                    p.relatorio.creator?.name || "(Usuário sem nome)",
                    p.quantity.toString(),
                    `R$ ${p.valor.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`,
                    `R$ ${valorTotal.toLocaleString("pt-br", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
                ];
                break;
        }

        return `
            <tr>
                ${values.map((v) => `<td>${v}</td>`).join("")}
            </tr>
        `;
    }).join("");

    const html = `
            <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; font-size: 10px; text-align: center; }
                        th { background: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; }
                        .header-text { text-align: center; font-weight: bold; font-size: 14px; }
                        .header-text p { margin: 0; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <img src="data:image/png;base64,${logo1}" style="height: 100px;" />
                        <div class="header-text">
                            Estado do Pará<br/>
                            Prefeitura Municipal de São Félix do Xingu<br/>
                            Secretaria Executiva Municipal de Educação-SEMED
                        </div>
                        <img src="data:image/png;base64,${logo2}" style="height: 75px;" />
                    </div>
                    <h2 style="text-align:center; margin-top:20px;">Produtos da Secretaria</h2>
                    <div class="header-text">
                        <p>${message}</p>
                        <p>Retirado em ${new Date().toLocaleString("pt-br")}</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <thead>
                            <tr>
                                ${thead}
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="${colspan-1}" style="text-align: right; font-weight: bold;">Total:</td>
                                <td colspan="2">
                                    R$ ${produtos.reduce((acc, p) => acc + (p.valor * p.quantity), 0).toLocaleString("pt-br", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2
    })}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
            </html>`;

    const browser = await puppeteer.launch({ 
        headless: "new" , 
        args: ["--no-sandbox", "--disable-setuid-sandbox"] 
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    const buffer = await page.pdf({ format: "A4" });
    await browser.close();

    return buffer;
};