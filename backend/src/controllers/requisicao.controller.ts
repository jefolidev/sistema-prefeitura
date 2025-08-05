import { Request, Response } from "express";
import { GenerateReportResponse, RequisicaoCancelQuery, RequisicaoCreateRequestBody, RequisicaoQuery, RequisitionGenerateReportBody, requisitionGenerateReportBody, RequisitionItem } from "../@types/requisicoes";
import { JwtUser } from "../@types/user";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";
import { generateRelatorioPdf } from "../utils/generate-relatorio-pdf";
import { RelatorioData } from "../utils/generate-report-pdf";

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
        const produtoIds = [...new Set(itens.map(i => i.produtoId))];
        const products = await prisma.produtos.findMany({
            where: { id: { in: produtoIds } },
            select: { id: true, fornecedorId: true }
        });

        if (products.length !== produtoIds.length) {
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
            where: { id: { in: produtoIds } },
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

    const {
        startDate,
        endDate,
        isGroups,
        isDepartments,
        isProviders,
        shouldShowRequisitionByProviders,
        shouldShowAllExpensesByProviderInPeriod,
        shouldShowHowMuchEachDepartmentSpentWithEachProvider,
        shouldShowHowHasBeenSpentedByGroupInDepartments,
        shouldShowDetailedItemsByEachGroup,
    } = parsed.data;

    try {
        const queryDateFilter = {
            ...(startDate && { createdAt: { gte: startDate } }),
            ...(endDate && { createdAt: { lte: endDate } })
        };

        const requisitions = await prisma.relatorios.findMany({
            where: queryDateFilter,
            include: {
                departamento: { select: { id: true, name: true } },
                itens: {
                    include: {
                        produto: {
                            select: {
                                id: true,
                                name: true,
                                grupo: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        const spendByDepartment: Record<string, number> = {};
        const spendByGroup: Record<string, number> = {};
        const spendByProvider: Record<string, number> = {};

        const spendByDepartmentAndProvider: Record<string, Record<string, number>> = {};

        let allExpensesByProviderInPeriod: { providerId: string; total: number }[] | undefined = undefined;

        for (const requisition of requisitions) {
            const { fornecedorId, departamentoId, itens } = requisition;
            const total = itens.reduce((acc, item) => acc + (Number(item.valor) * item.quantity), 0);

            if (isProviders) {
                spendByProvider[fornecedorId] = (spendByProvider[fornecedorId] ?? 0) + total;
            }

            if (departamentoId && fornecedorId) {
                if (shouldShowHowMuchEachDepartmentSpentWithEachProvider) {
                    if (!spendByDepartmentAndProvider[departamentoId]) {
                        spendByDepartmentAndProvider[departamentoId] = {};
                    }

                    const totalByItem = requisition.itens.reduce((acc, item) => {
                        return acc + (Number(item.valor) * item.quantity);
                    }, 0);

                    spendByDepartmentAndProvider[departamentoId][fornecedorId] =
                        (spendByDepartmentAndProvider[departamentoId][fornecedorId] ?? 0) + totalByItem;
                }

                if (isDepartments) {
                    spendByDepartment[departamentoId] = (spendByDepartment[departamentoId] ?? 0) + total;
                }
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

        if (shouldShowAllExpensesByProviderInPeriod) {
            allExpensesByProviderInPeriod = Object.entries(spendByProvider).map(([id, value]) => ({
                providerId: id,
                startDate,
                endDate,
                total: Number(value.toFixed(2))
            }));
        }

        const result: GenerateReportResponse & {
            allExpensesByProviderInPeriod?:
            { providerId: string; total: number }[]
        } = {
            byDepartment: Object.entries(spendByDepartment).map(([id, value]) => ({
                departamentoId: id,
                total: Number(value.toFixed(2))
            })),
            byGroup: Object.entries(spendByGroup).map(([id, value]) => ({
                groupId: id,
                total: Number(value.toFixed(2))
            })),
            byProvider: isProviders
                ? Object.entries(spendByProvider).map(([id, value]) => ({
                    providerId: id,
                    total: Number(value.toFixed(2))
                }))
                : [],
            ...(allExpensesByProviderInPeriod && { allExpensesByProviderInPeriod })
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

            const grouped: Record<string, { fornecedor: string, requisicoes: RequisitionItem[] }> = {};

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
                        department: requisition.departamento?.name ?? "Departamento desconhecido",
                        date: requisition.createdAt.toString().split("T")[0],
                        product: {
                            ...item,
                            createdAt: item.createdAt.toISOString(),
                            updatedAt: item.updatedAt.toISOString()
                        },
                        unitPrice: Number(item.valor),
                        total: Number(item.valor) * item.quantity
                    });
                }
            }

            result.shouldShowRequisitionByProviders = Object.values(grouped);
        }

        if (shouldShowHowMuchEachDepartmentSpentWithEachProvider) {
            result.shouldShowHowMuchEachDepartmentSpentWithEachProvider = [];

            for (const [departmentId, providers] of Object.entries(spendByDepartmentAndProvider)) {
                for (const [providerId, total] of Object.entries(providers)) {
                    result.shouldShowHowMuchEachDepartmentSpentWithEachProvider.push({
                        departmentId,
                        providerId,
                        total: Number(total.toFixed(2))
                    });
                }
            }
        }
        if (shouldShowHowHasBeenSpentedByGroupInDepartments) {
            const spendByGroupInDepartment: Record<string, Record<string, number>> = {};

            for (const requisition of requisitions) {
                const departmentName = requisition.departamento?.name ?? "Desconhecido";

                if (!spendByGroupInDepartment[departmentName]) {
                    spendByGroupInDepartment[departmentName] = {};
                }

                for (const item of requisition.itens) {
                    const groupName = item.produto?.grupo?.name ?? "Sem grupo";
                    const total = Number(item.valor) * item.quantity;

                    spendByGroupInDepartment[departmentName][groupName] =
                        (spendByGroupInDepartment[departmentName][groupName] ?? 0) + total;
                }
            }

            result.shouldShowHowHasBeenSpentedByGroupInDepartments = spendByGroupInDepartment;
        }

        if (shouldShowDetailedItemsByEachGroup) {
            const detailedItemsByGroup: Record<string, {
                produto: string;
                unitPrice: number;
            }[]> = {};

            const alreadyAdded = new Set<string>(); // pra garantir unicidade

            for (const requisition of requisitions) {
                for (const item of requisition.itens) {
                    const produtoId = item.produto?.id;
                    const groupName = item.produto?.grupo?.name ?? "Sem grupo";
                    const productName = item.produto?.name ?? "Sem nome";
                    const unitPrice = Number(item.valor);

                    if (!produtoId) continue;

                    const key = `${groupName}-${produtoId}`;
                    if (alreadyAdded.has(key)) continue;

                    alreadyAdded.add(key);

                    if (!detailedItemsByGroup[groupName]) {
                        detailedItemsByGroup[groupName] = [];
                    }

                    detailedItemsByGroup[groupName].push({
                        produto: productName,
                        unitPrice,
                    });
                }
            }

            result.shouldShowDetailedItemsByEachGroup = detailedItemsByGroup;
        }

        // Monta o objeto do tipo RelatorioData para gerar PDF
        const relatorioParaPdf: RelatorioData = {
            seq: 1, // ou algum ID sequencial real
            fornecedor: { name: "Fornecedor Exemplo" }, // ajuste conforme seu dado real
            user: { name: "Usuário Exemplo" }, // idem
            creator: null, // ou preencha se tiver
            nameRetirante: null,
            observacao: null,
            itens: requisitions.flatMap(r =>
                r.itens.map(i => ({
                    quantity: i.quantity,
                    valor: Number(i.valor),
                    produto: {
                        name: i.produto.name,
                        unidadeMedida: "UN", // se tiver no seu dado, senão fixo
                        valor: Number(i.valor),
                        grupo: i.produto.grupo ? { name: i.produto.grupo.name } : undefined,
                    },
                }))
            ),
            createdAt: new Date(),
            byGroup: result.byGroup?.map(g => ({ groupId: g.groupId, name: g.groupId, total: g.total })) || [],
            byDepartment: result.byDepartment?.map(d => ({
                departamentoId: d.departamentoId, name: d.departamentoId, total: d.total
            })) || [],
            byProvider: result.byProvider?.map(p => ({
                providerId: p.providerId, name: p.providerId, total: p.total
            })) || [],
            shouldShowRequisitionByProviders: result.shouldShowRequisitionByProviders,
            shouldShowHowMuchEachDepartmentSpentWithEachProvider:
                result.shouldShowHowMuchEachDepartmentSpentWithEachProvider,
            shouldShowHowHasBeenSpentedByGroupInDepartments: result.shouldShowHowHasBeenSpentedByGroupInDepartments,
            shouldShowDetailedItemsByEachGroup: result.shouldShowDetailedItemsByEachGroup,
            showByGroup: !!result.byGroup?.length,
            showByDepartment: !!result.byDepartment?.length,
            showByProvider: !!result.byProvider?.length,
            showRequisitionByProviders: !!result.shouldShowRequisitionByProviders,
            showHowMuchEachDepartmentSpentWithEachProvider:
                !!result.shouldShowHowMuchEachDepartmentSpentWithEachProvider,
            showDetailedItemsByEachGroup: !!result.shouldShowDetailedItemsByEachGroup,
        };

        // Gera o PDF (buffer)
        const pdfBuffer = await generateRelatorioPdf(relatorioParaPdf);

        res.status(200).json({
            status: 200,
            data: result,
            pdf: pdfBuffer.toString("base64")
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: `Erro ao gerar relatorio, ${error}`,
            ...(application.type === "development" && { error })
        });
    }
};