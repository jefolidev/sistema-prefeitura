import { Request, Response } from "express";

import { prisma } from "../shared/database/prisma";
import application from "../config/application";
import { ProdutosCreateRequestBody, ProdutosUpdateQuery } from "../@types/Produtos";
import { generatePdf } from "../utils/generate_pdf";

interface getAllRequest extends Request {
    query: {
        fornecedorId?: string;
    };
}

export const getAll = async (req: getAllRequest, res: Response): Promise<void> => {

    const { fornecedorId } = req.query;

    prisma.produtos.findMany({
        where: {
            ...(fornecedorId && { fornecedorId: String(fornecedorId) })
        }
    })
        .then(produtos => {
            res.json({
                status: 200,
                message: "Produtos encontrados com sucesso",
                data: produtos
            });
        })
        .catch(error => {
            res.status(500).json({
                status: 500,
                message: "Erro ao buscar produtos",
                ...(application.type === "development" && { error })
            });
        });
};

interface ProdutosGetByIdRequest extends Request {
    params: ProdutosUpdateQuery;
}
export const getById = async (req: ProdutosGetByIdRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do produto não informado"
        });
        return;
    }

    prisma.produtos.findUnique({
        where: { id: String(id) }
    }).then(produto => {
        if (!produto) {
            res.status(404).json({
                status: 404,
                message: "Produto não encontrado"
            });
            return;
        }
        res.json({
            status: 200,
            message: "Produto encontrado com sucesso",
            data: produto
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar produto",
            ...(application.type === "development" && { error })
        });
    });
};

interface ProdutosCreateRequest extends Request {
    body: ProdutosCreateRequestBody;
}
export const create = async (req: ProdutosCreateRequest, res: Response): Promise<void> => {
    const { 
        name, description,
        fornecedorId, departamentoId,
        unidadeMedida, valor, grupoId
    } = req.body;

    if (
        !name ||  !fornecedorId ||
        !unidadeMedida || valor === undefined ||
        !grupoId
    ) {
        res.status(400).json({
            status: 400,
            message: "Dados do produto incompletos"
        });
        return;
    }

    prisma.produtos.create({
        data: {
            name,
            description,
            fornecedorId,
            ...(departamentoId !== undefined && { departamentoId }),
            unidadeMedida,
            valor,
            grupoId
        }
    }).then(produto => {
        res.status(201).json({
            status: 201,
            message: "Produto criado com sucesso",
            data: produto
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao criar produto",
            ...(application.type === "development" && { error })
        });
    });
};

interface ProdutosUpdateRequest extends Request {
    params: ProdutosUpdateQuery;
    body: ProdutosCreateRequestBody;
}
export const update = async (req: ProdutosUpdateRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { 
        name, description,  
        quantity, fornecedorId, departamentoId, 
        unidadeMedida, valor, grupoId
    } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do produto não informado"
        });
        return;
    }

    prisma.produtos.update({
        where: { id: String(id) },
        data: {
            ...(name !== undefined && { name }),
            ...(description !== undefined && { description }),
            ...(quantity !== undefined && { quantity }),
            ...(fornecedorId !== undefined && { fornecedorId }),
            ...(departamentoId !== undefined && { departamentoId }),
            ...(unidadeMedida !== undefined && { unidadeMedida }),
            ...(valor !== undefined && { valor }),
            ...(grupoId !== undefined && { grupoId })
        }
    }).then(produto => {
        res.json({
            status: 200,
            message: "Produto atualizado com sucesso",
            data: produto
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao atualizar produto",
            ...(application.type === "development" && { error })
        });
    });
};

interface ProdutosRemoveRequest extends Request {
    params: ProdutosUpdateQuery;
}
export const remove = async (req: ProdutosRemoveRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do produto não informado"
        });
        return;
    }

    prisma.produtos.delete({
        where: { id: String(id) }
    }).then(() => {
        res.json({
            status: 200,
            message: "Produto removido com sucesso"
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao remover produto",
            ...(application.type === "development" && { error })
        });
    });
};

interface ProdutosExportPdfRequest extends Request {
    query: {
        startDate?: string;
        endDate?: string;
        reportModel?: string;
    }
}
export const exportPdf = async (req: ProdutosExportPdfRequest, res: Response): Promise<void> => {
    const { startDate, endDate, reportModel } = req.query;

    const endDateParsed = endDate ? new Date(endDate) : undefined;
    endDateParsed?.setDate(endDateParsed.getDate() + 1);

    try {
        const produtos = await prisma.relatorioItens.findMany({
            where: {
                ...(startDate && { createdAt: { gte: new Date(startDate) } }),
                ...(endDate && { createdAt: { lte: endDateParsed } })
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
        
        const buffer = await generatePdf(
            produtos,
            `Relatório de Produtos${startDate ? ` de ${new Date(startDate).toLocaleDateString("pt-br")}` : ""}${endDate ? ` até ${new Date(endDate).toLocaleDateString("pt-br")}` : ""}`,
            reportModel || "default"
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=produtos.pdf");
        res.send(buffer);
    } catch (error) {
        console.error("Erro ao gerar PDF:", error);

        res.status(500).json({
            status: 500,
            message: "Erro ao gerar PDF",
            ...(application.type === "development" && { error })
        });
    }
};
