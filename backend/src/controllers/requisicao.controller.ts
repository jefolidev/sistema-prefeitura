import { Request, Response } from "express";
import { RequisicaoCancelQuery, RequisicaoCreateRequestBody, RequisicaoQuery, RequisitionGenerateReportBody, requisitionGenerateReportBody } from "../@types/requisicoes";
import { JwtUser } from "../@types/user";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";
import { generateRelatorioPdf } from "../utils/generate-relatorio-pdf";

interface RequisicaoCreateRequest extends Request {
    body: RequisicaoCreateRequestBody;
}

export const create = async (req: RequisicaoCreateRequest, res: Response): Promise<void> => {
    const { fornecedorId, departamentoId, userId, nameRetirante, observacoes: observacao, itens } = req.body;

    const token = req.headers["x-access-token"] as string;
    let tokenData: JwtUser | null = null;
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

interface RequisitionGenerateReportRequest extends Request {
    body: RequisitionGenerateReportBody
}

interface GenerateReportResponse {
    byDepartment: { departamentoId: string; total: number }[];
    byGroup: { groupId: string; total: number }[];
    byProvider: { providerId: string; total: number }[];
    requisitionsOrganizedByProviders?: unknown;
}

export const generateReport = async (req: RequisitionGenerateReportRequest, res: Response): Promise<void> => {
    const parsed = requisitionGenerateReportBody.safeParse(req.body);

    if (!parsed.success) {
        res.status(400).json({
            status: 400,
            message: "Invalid request data.",
            issues: parsed.error.format(),
        });
    }

    if (!parsed.data) {
        res.status(400).json({
            status: 400,
            message: "Invalid request data.",
            issues: parsed.error.format(),
        });
        return;
    }

    const { startDate, endDate, isGroups, isDepartments, isProviders, shouldShowRequisitionByProviders } = parsed.data;

    try {
        const queryDateFilter = {
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } })
        };

        const requisitions = await prisma.relatorios.findMany({
            where: queryDateFilter,
            include: {
                fornecedor: { select: { id: true, name: true } },
                departamento: { select: { id: true, name: true } },
                itens: true,
            }
        });

        const spendByDepartment: Record<string, number> = {};
        const spendByGroup: Record<string, number> = {};
        const spendByProvider: Record<string, number> = {};

        for (const requisition of requisitions) {
            const { fornecedorId, departamentoId, itens } = requisition;

            const total = itens.reduce((acc, item) => acc + (Number(item.valor) * item.quantity), 0);

            if (isProviders) {
                if (!spendByProvider[fornecedorId]) {
                    spendByProvider[fornecedorId] = 0;
                }

                spendByProvider[fornecedorId] += total;
            }

            if (isDepartments)
                if (departamentoId) {
                    spendByDepartment[departamentoId] = (spendByDepartment[departamentoId] ?? 0) + total;
                }

            if (isGroups) {
                const produtos = await Promise.all(
                    itens.map(item => prisma.produtos.findFirst({ where: { id: item.produtoId } }))
                );

                for (let i = 0; i < itens.length; i++) {
                    const item = itens[i];
                    const produto = produtos[i];

                    if (!produto || !produto.grupoId) continue;

                    spendByGroup[produto.grupoId] =
                        (spendByGroup[produto.grupoId] ?? 0) + (Number(item.valor) * item.quantity);
                }
            }
        }

        const result: GenerateReportResponse = {
            byDepartment: Object.entries(spendByDepartment).map(([id, value]) => ({
                departamentoId: id,
                total: Number(value.toFixed(2))
            })),
            byGroup: Object.entries(spendByGroup).map(([id, value]) => ({
                groupId: id,
                total: Number(value.toFixed(2))
            })),
            byProvider: Object.entries(spendByProvider).map(([id, value]) => ({
                providerId: id,
                total: Number(value.toFixed(2))
            })),
        };

        if (shouldShowRequisitionByProviders) {
            const requisitionsByProvider = await prisma.relatorios.findMany({
                where: queryDateFilter,
                include: {
                    fornecedor: { select: { id: true, name: true } },
                    departamento: { select: { name: true } },
                    itens: {
                        include: {
                            produto: { select: { name: true } }
                        }
                    }
                }
            });

            type RequisitionByProviderItem = {
                id: string;
                department?: string;
                date: string;
                product: typeof requisitionsByProvider[number]["itens"][number];
                unitPrice: number;
                total: number;
            };

            const grouped: Record<string, { fornecedor: string, requisicoes: RequisitionByProviderItem[] }> = {};

            for (const requisition of requisitionsByProvider) {
                const fornecedor = requisition.fornecedor.name || "Fornecedor desconhecido";

                if (!grouped[requisition.fornecedorId]) {
                    grouped[requisition.fornecedorId] = {
                        fornecedor,
                        requisicoes: []
                    };
                }

                for (const item of requisition.itens) {
                    grouped[requisition.fornecedorId].requisicoes.push({
                        id: requisition.id,
                        department: requisition.departamento?.name,
                        date: requisition.createdAt.toString().split("T")[0],
                        product: item,
                        unitPrice: Number(item.valor),
                        total: Number(item.valor) * item.quantity
                    });
                }
            }

            result.requisitionsOrganizedByProviders = Object.values(grouped);
        }

        res.status(200).json({
            status: 200,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Erro ao gerar relatorio",
            ...(application.type === "development" && { error })
        });
    }
};