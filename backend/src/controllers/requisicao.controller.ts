import { Request, Response } from "express";
import { prisma } from "../shared/database/prisma";
import application from "../config/application";
import { RequisicaoCreateRequestBody, RequisicaoCancelQuery, RequisicaoQuery } from "../@types/Requisicoes";
import { generateRelatorioPdf } from "../utils/generate-relatorio-pdf";
import { JwtUser } from "../@types/User";

interface RequisicaoCreateRequest extends Request {
    body: RequisicaoCreateRequestBody;
}

export const create = async (req: RequisicaoCreateRequest, res: Response): Promise<void> => {
    const { fornecedorId, departamentoId, userId, nameRetirante, observacoes:observacao, itens } = req.body;

    const token = req.headers["x-access-token"] as string;
    let tokenData:JwtUser|null = null;
    if (token) {
        try {
            const base64Payload = token.split(".")[1];
            const payload = Buffer.from(base64Payload, "base64").toString("utf-8");
            tokenData = JSON.parse(payload) as JwtUser;
        } catch {
            res.status(400).json({
                status: 400,
                message: "Token inválido"
            });
            return;
        }
    }
    

    if (!fornecedorId || !userId || !nameRetirante || !Array.isArray(itens) || itens.length === 0) {
        res.status(400).json({
            status: 400,
            message: "Dados do relatorio incompletos"
        });
        return;
    }

    if (itens.length > 9) {
        res.status(400).json({
            status: 400,
            message: "Um relatorio pode ter no maximo 9 produtos"
        });
        return;
    }

    try {
        // verify all products belong to fornecedor
        const productIds = [...new Set(itens.map(i => i.produtoId))];
        const products = await prisma.produtos.findMany({
            where: { id: { in: productIds } },
            select: { id: true, fornecedorId: true }
        });
        
        if (products.length !== productIds.length) {
            res.status(400).json({
                status: 400,
                message: "Produtos invalidos"
            });
            return;
        }

        const invalid = products.some(p => p.fornecedorId !== fornecedorId);
        if (invalid) {
            res.status(400).json({
                status: 400,
                message: "Todos os produtos devem ser do mesmo fornecedor"
            });
            return;
        }

        const precos = await prisma.produtos.findMany({
            where: { id: { in: productIds } },
            select: { id: true, valor: true }
        });

        const creatorId = tokenData?.id;

        const relatorio = await prisma.relatorios.create({
            data: {
                fornecedorId,
                ...(departamentoId !== undefined && { departamentoId }),
                userId,
                nameRetirante,
                observacao,
                creatorId,
                itens: {
                    create: itens.map(item => ({
                        produtoId: item.produtoId,
                        quantity: item.quantity,
                        valor: precos.find(p => p.id === item.produtoId)?.valor || 0
                    }))
                }
            },
        });

        res.status(201).json({
            status: 201,
            message: "Relatorio criado com sucesso",
            data: relatorio
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao criar relatorio",
            ...(application.type === "development" && { error })
        });
    }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
    try {
        const relatorios = await prisma.relatorios.findMany({
            include: {
                fornecedor: {
                    select: { id: true, name: true }
                },
                user: {
                    select: { id: true, name: true }
                },
                itens: {
                    include: {
                        produto: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        res.json({
            status: 200,
            message: "Relatorios encontrados com sucesso",
            data: relatorios
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar relatorios",
            ...(application.type === "development" && { error })
        });
    }
};

interface RequisicaoDetailRequest extends Request {
    params: RequisicaoQuery;
}

export const getById = async (req: RequisicaoDetailRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do relatorio não informado",
        });
        return;
    }

    try {
        const relatorio = await prisma.relatorios.findUnique({
            where: { id: String(id) },
            include: {
                fornecedor: { select: { id: true, name: true } },
                user: { select: { id: true, name: true } },
                itens: {
                    include: {
                        produto: {
                            select: { id: true, name: true, unidadeMedida: true, valor: true }
                        }
                    }
                }
            }
        });

        if (!relatorio) {
            res.status(404).json({
                status: 404,
                message: "Relatorio não encontrado",
            });
            return;
        }

        res.json({
            status: 200,
            message: "Relatorio encontrado com sucesso",
            data: relatorio,
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar relatorio",
            ...(application.type === "development" && { error })
        });
    }
};

export const exportPdf = async (req: RequisicaoDetailRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do relatorio não informado",
        });
        return;
    }

    try {
        const relatorio = await prisma.relatorios.findUnique({
            where: { id: String(id) },
            include: {
                fornecedor: { select: { id: true, name: true } },
                user: { select: { id: true, name: true } },
                creator: { select: { id: true, name: true } },
                itens: {
                    include: {
                        produto: { select: { id: true, name: true, unidadeMedida: true, valor: true } }
                    }
                }
            }
        });

        if (!relatorio) {
            res.status(404).json({
                status: 404,
                message: "Relatorio não encontrado",
            });
            return;
        }

        const buffer = await generateRelatorioPdf(relatorio);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=relatorio-${relatorio.seq}.pdf`);
        res.send(buffer);
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao gerar PDF",
            ...(application.type === "development" && { error })
        });
    }
};

interface RequisicaoCancelRequest extends Request {
    params: RequisicaoCancelQuery;
}

export const cancel = async (req: RequisicaoCancelRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do relatorio não informado"
        });
        return;
    }

    try {
        const relatorio = await prisma.relatorios.update({
            where: { id: String(id) },
            data: { isCanceled: true }
        });

        res.json({
            status: 200,
            message: "Relatorio cancelado com sucesso",
            data: relatorio
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao cancelar relatorio",
            ...(application.type === "development" && { error })
        });
    }
};
