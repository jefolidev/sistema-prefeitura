import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import { Prisma } from "@prisma/client";

import { prisma } from "../shared/database/prisma";
import application from "../config/application";
import { FornecedoresCreateRequestBody, FornecedoresUpdateQuery } from "../@types/Fornecedores";
import { generatePdf } from "../utils/generate_pdf";


export const getAll = async (req: Request, res: Response): Promise<void> => {
    prisma.fornecedores.findMany().then(fornecedores => {
        res.json({
            status: 200,
            message: "Fornecedores encontrados com sucesso",
            data: fornecedores
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar fornecedores",
            ...(application.type == "development" && {error: error}),
        });
    });
};

interface FornecedorGetByIdRequest extends Request {
    params: FornecedoresUpdateQuery
}

export const getById = async (req: FornecedorGetByIdRequest, res: Response): Promise<void> => {

    const { id } = req.params;

    prisma.fornecedores.findUnique({
        where: {
            id: id
        }
    }).then(fornecedor => {
        if (fornecedor) {
            res.json({
                status: 200,
                message: "Fornecedor encontrado com sucesso",
                data: fornecedor
            });
        } else {
            res.status(404).json({
                status: 404,
                message: "Fornecedor não encontrado"
            });
        }
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar fornecedor",
            ...(application.type == "development" && {error: error}),
        });
    });

};

interface FornecedorCreateRequest extends Request {
    body: FornecedoresCreateRequestBody
}

export const create = async (req: FornecedorCreateRequest, res: Response): Promise<void> => {

    const { name, cnpj, razaoSocial, endereco, email, telefone, observacoes } = req.body;

    if (!name) {
        res.status(400).json({
            status: 400,
            message: "Nome do fornecedor é obrigatório"
        });
        return;
    }

    prisma.fornecedores.create({
        data: {
            name,
            ...(cnpj && { cnpj }),
            ...(razaoSocial && { razaoSocial }),
            ...(endereco && { endereco }),
            ...(email && { email }),
            ...(telefone && { telefone }),
            ...(observacoes && { observacoes })
        }
    }).then(fornecedor => {
        res.status(201).json({
            status: 201,
            message: "Fornecedor criado com sucesso",
            data: fornecedor
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao criar fornecedor",
            ...(application.type == "development" && {error: error}),
        });
    });

};

interface FornecedorUpdateRequest extends Request {
    body: FornecedoresCreateRequestBody;
    params: FornecedoresUpdateQuery
};

export const update = async (req: FornecedorUpdateRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, cnpj, razaoSocial, endereco, email, telefone, observacoes } = req.body;

    if (!name) {
        res.status(400).json({
            status: 400,
            message: "Nome do fornecedor é obrigatório"
        });
        return;
    }

    prisma.fornecedores.update({
        where: {
            id: id
        },
        data: {
            ...(name && { name }),
            ...(cnpj && { cnpj }),
            ...(razaoSocial && { razaoSocial }),
            ...(endereco && { endereco }),
            ...(email && { email }),
            ...(telefone && { telefone }),
            ...(observacoes && { observacoes })
        }
    }).then(fornecedor => {
        res.json({
            status: 200,
            message: "Fornecedor atualizado com sucesso",
            data: fornecedor
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao atualizar fornecedor",
            ...(application.type == "development" && {error: error}),
        });
    });
};

interface FornecedorDeleteRequest extends Request {
    params: FornecedoresUpdateQuery
};

export const remove = async (req: FornecedorDeleteRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    prisma.fornecedores.delete({
        where: {
            id: id
        }
    }).then(() => {
        res.json({
            status: 200,
            message: "Fornecedor removido com sucesso"
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao remover fornecedor",
            ...(application.type == "development" && {error: error}),
        });
    });
};

export const exportPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

        const where: Prisma.FornecedoresWhereInput = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) (where.createdAt as Prisma.DateTimeFilter).gte = new Date(startDate);
            if (endDate) (where.createdAt as Prisma.DateTimeFilter).lte = new Date(endDate);
        }

        const fornecedores = await prisma.fornecedores.findMany({ where });

        const logo1 = fs.readFileSync(path.resolve("src/assets/Logo1SEMED.png")).toString("base64");
        const logo2 = fs.readFileSync(path.resolve("src/assets/Logo2SEMED.png")).toString("base64");

        const rows = fornecedores.map(f => `
            <tr>
                <td>${f.name}</td>
                <td>${f.cnpj ?? ""}</td>
                <td>${f.razaoSocial ?? ""}</td>
                <td>${f.endereco ?? ""}</td>
                <td>${f.email ?? ""}</td>
                <td>${f.telefone ?? ""}</td>
                <td>${f.observacoes ?? ""}</td>
                <td>${f.createdAt.toISOString().split("T")[0]}</td>
            </tr>`).join("\n");

        const html = `
            <html>
                <head>
                    <meta charset="utf-8" />
                    <style>
                        body { font-family: Arial, sans-serif; margin: 40px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        th { background: #f2f2f2; }
                        .header { display: flex; justify-content: space-between; align-items: center; }
                        .header-text { text-align: center; font-size: 14px; font-weight: bold; }
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
                        <img src="data:image/png;base64,${logo2}" style="height: 100px;" />
                    </div>
                    <h2 style="text-align:center; margin-top:20px;">Relatório de Fornecedores</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CNPJ</th>
                                <th>Razão Social</th>
                                <th>Endereço</th>
                                <th>E-mail</th>
                                <th>Telefone</th>
                                <th>Observações</th>
                                <th>Data de Criação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </body>
            </html>`;

        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "load" });
        const buffer = await page.pdf({ format: "A4" });
        await browser.close();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=fornecedores.pdf");
        res.send(buffer);
    } catch (error) {

        res.status(500).json({
            status: 500,
            message: "Erro ao gerar PDF",
            ...(application.type == "development" && { error })
        });
    }
};

export const exportProdutosPdf = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params as { id?: string };
        const { 
            startDate, 
            endDate:endDate_, 
            reportModel 
        } = req.query as { startDate?: string; endDate?: string, reportModel?: string };

        if (!id) {
            res.status(400).json({ status: 400, message: "ID do fornecedor não informado" });
            return;
        }

        const endDate = endDate_ ? new Date(endDate_) : new Date();
        endDate.setDate(endDate.getDate() + 1); // Inclui o dia inteiro

        const produtos = await prisma.relatorioItens.findMany({
            where: {
                relatorio: {
                    fornecedorId: id,
                    ...(startDate || endDate ? {
                        createdAt: {
                            ...(startDate && { gte: new Date(startDate) }),
                            ...(endDate && { lte: new Date(endDate) })
                        }
                    } : {})
                }
            },
            select: {
                valor: true,
                quantity: true,
                produto: {
                    select: {
                        name: true,
                        fornecedor: {
                            select: {
                                name: true
                            }
                        },
                        grupo: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                relatorio: {
                    select: {
                        seq: true,
                        createdAt: true,
                        creator: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        }) as unknown as {
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
        }[];

        const fornecedor = await prisma.fornecedores.findUnique({
            where: { id: String(id) },
            select: { name: true }
        });
        
        const buffer = await generatePdf(
            produtos,
            `Relatório de Produtos do Fornecedor "${fornecedor?.name ||"(Sem nome)"}" ${startDate ? ` de ${new Date(startDate).toLocaleDateString("pt-br")}` : ""}${endDate ? ` até ${new Date(endDate).toLocaleDateString("pt-br")}` : ""}`,
            reportModel || "default"
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=fornecedor_produtos.pdf");
        res.send(buffer);
    } catch (error) {
        console.log("Erro ao gerar PDF:", error);
        res.status(500).json({
            status: 500,
            message: "Erro ao gerar PDF",
            ...(application.type == "development" && { error })
        });
    }
};

