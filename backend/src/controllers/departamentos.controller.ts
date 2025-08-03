import { Request, Response } from "express";

import { DepartamentosCreateRequestBody, DepartamentosUpdateQuery } from "../@types/departamentos";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";
import { generatePdf } from "../utils/generate-pdf";

export const getAll = async (req: Request, res: Response): Promise<void> => {
    prisma.departamentos.findMany().then(departamentos => {
        res.json({
            status: 200,
            message: "Departamentos encontrados com sucesso",
            data: departamentos
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar departamentos",
            ...(application.type === "development" && { error: error }),
        });
    });
};

interface DepartamentosCreateRequest extends Request {
    params: DepartamentosUpdateQuery
}
export const getById = async (req: DepartamentosCreateRequest, res: Response): Promise<void> => {

    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do departamento não informado"
        });
        return;
    }

    prisma.departamentos.findUnique({
        where: { id: String(id) }
    }).then(departamento => {
        if (!departamento) {
            res.status(404).json({
                status: 404,
                message: "Departamento não encontrado"
            });
            return;
        }
        res.json({
            status: 200,
            message: "Departamento encontrado com sucesso",
            data: departamento
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao buscar departamento",
            ...(application.type === "development" && { error: error }),
        });
    });

};

interface DepartamentosCreateRequest extends Request {
    body: DepartamentosCreateRequestBody;
}
export const create = async (req: Request, res: Response): Promise<void> => {
    const { name, responsavel, cpf } = req.body;

    if (!name || !responsavel) {
        res.status(400).json({
            status: 400,
            message: "Nome ou responsável não informado"
        });
        return;
    }

    prisma.departamentos.create({
        data: { name, responsavel, ...(cpf !== undefined && { cpf }) }
    }).then(departamento => {
        res.status(201).json({
            status: 201,
            message: "Departamento criado com sucesso",
            data: departamento
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao criar departamento",
            ...(application.type === "development" && { error: error }),
        });
    });
};

interface DepartamentosUpdateRequest extends Request {
    params: DepartamentosUpdateQuery;
    body: DepartamentosCreateRequestBody;
}
export const update = async (req: DepartamentosUpdateRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, responsavel, cpf } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do departamento não informado"
        });
        return;
    }

    if (!name && !responsavel && !cpf) {
        res.status(400).json({
            status: 400,
            message: "Dados para atualização não informados"
        });
        return;
    }

    prisma.departamentos.update({
        where: { id: String(id) },
        data: {
            ...(name !== undefined && { name }),
            ...(responsavel !== undefined && { responsavel }),
            ...(cpf !== undefined && { cpf })
        }
    }).then(departamento => {
        res.json({
            status: 200,
            message: "Departamento atualizado com sucesso",
            data: departamento
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao atualizar departamento",
            ...(application.type === "development" && { error: error }),
        });
    });
};

interface DepartamentosRemoveRequest extends Request {
    params: DepartamentosUpdateQuery;
}
export const remove = async (req: DepartamentosRemoveRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do departamento não informado"
        });
        return;
    }

    prisma.departamentos.delete({
        where: { id: String(id) }
    }).then(() => {
        res.json({
            status: 200,
            message: "Departamento removido com sucesso"
        });
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Erro ao remover departamento",
            ...(application.type === "development" && { error: error }),
        });
    });
};

interface DepartamentosExportPdfRequest extends Request {
    query: {
        startDate?: string;
        endDate?: string;
        reportModel?: string;
    };
    params: {
        id?: string;
    }
}

export const exportPdf = async (req: DepartamentosExportPdfRequest, res: Response): Promise<void> => {

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

        const departamento = await prisma.departamentos.findUnique({
            where: { id: String(id) },
            select: { name: true }
        });

        const produtos = await prisma.relatorioItens.findMany({
            where: {
                produto: {
                    departamentoId: String(id)
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

        const buffer = await generatePdf(
            produtos,
            `Relatório de Produtos do Departamento "${departamento?.name || "(Departamento sem nome)"}" ${startDate ? ` de ${new Date(startDate).toLocaleDateString("pt-br")}` : ""}${endDate ? ` até ${new Date(endDate).toLocaleDateString("pt-br")}` : ""}`,
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