import { Request, Response } from "express";

import { GruposCreateRequestBody, GruposUpdateQuery } from "../@types/Grupos";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";
import { generatePdf } from "../utils/generate-pdf";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
    prisma.grupos.findMany()
        .then(grupos => {
            res.json({
                status: 200,
                message: "Grupos encontrados com sucesso",
                data: grupos
            });
        })
        .catch(error => {
            res.status(500).json({
                status: 500,
                message: "Erro ao buscar grupos",
                ...(application.type === "development" && { error })
            });
        });
};

interface GrupoGetByIdRequest extends Request {
    params: GruposUpdateQuery;
}
export const getById = async (req: GrupoGetByIdRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do grupo não informado"
        });
        return;
    }

    prisma.grupos.findUnique({
        where: { id: String(id) }
    }).then(grupo => {
        if (!grupo) {
            res.status(404).json({
                status: 404,
                message: "Grupo não encontrado"
            });
            return;
        }
        res.json({
            status: 200,
            message: "Grupo encontrado com sucesso",
            data: grupo
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar grupo",
            ...(application.type === "development" && { error })
        });
    });
};

interface GrupoCreateRequest extends Request {
    body: GruposCreateRequestBody;
}
export const create = async (req: GrupoCreateRequest, res: Response): Promise<void> => {
    const { name } = req.body;

    if (!name) {
        res.status(400).json({
            status: 400,
            message: "Nome do grupo não informado"
        });
        return;
    }

    prisma.grupos.create({
        data: { name }
    }).then(grupo => {
        res.status(201).json({
            status: 201,
            message: "Grupo criado com sucesso",
            data: grupo
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao criar grupo",
            ...(application.type === "development" && { error })
        });
    });
};

interface GrupoUpdateRequest extends Request {
    params: GruposUpdateQuery;
    body: GruposCreateRequestBody;
}
export const update = async (req: GrupoUpdateRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do grupo não informado"
        });
        return;
    }

    if (!name) {
        res.status(400).json({
            status: 400,
            message: "Nome do grupo não informado"
        });
        return;
    }

    prisma.grupos.update({
        where: { id: String(id) },
        data: { name }
    }).then(grupo => {
        res.json({
            status: 200,
            message: "Grupo atualizado com sucesso",
            data: grupo
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao atualizar grupo",
            ...(application.type === "development" && { error })
        });
    });
};

interface GrupoRemoveRequest extends Request {
    params: GruposUpdateQuery;
}
export const remove = async (req: GrupoRemoveRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do grupo não informado"
        });
        return;
    }

    prisma.grupos.delete({
        where: { id: String(id) }
    }).then(() => {
        res.json({
            status: 200,
            message: "Grupo removido com sucesso"
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao remover grupo",
            ...(application.type === "development" && { error })
        });
    });
};

interface GrupoExportRequest extends Request {
    params: GruposUpdateQuery;
    query: {
        startDate?: string;
        endDate?: string;
        reportModel?: string;
    };
}

export const exportPdf = async (req: GrupoExportRequest, res: Response): Promise<void> => {

    const { id } = req.params;
    const { startDate, endDate, reportModel } = req.query;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do grupo não informado"
        });
        return;
    }

    const endDateParsed = endDate ? new Date(endDate) : undefined;
    endDateParsed?.setDate(endDateParsed.getDate() + 1);

    try {
        const produtos = await prisma.relatorioItens.findMany({
            where: {
                produto: {
                    grupoId: String(id)
                },
                createdAt: {
                    ...(startDate && { gte: new Date(startDate) }),
                    ...(endDate && { lte: endDateParsed })
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

        const grupo = await prisma.grupos.findUnique({
            where: { id: String(id) },
            select: { name: true }
        });

        const buffer = await generatePdf(
            produtos,
            `Relatório de Produtos do Grupo "${grupo?.name || "(SEM NOME)"}" ${startDate ? ` de ${new Date(startDate).toLocaleDateString("pt-br")}` : ""}${endDate ? ` até ${new Date(endDate).toLocaleDateString("pt-br")}` : ""}`,
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