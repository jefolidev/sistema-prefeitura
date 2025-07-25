import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { sign, verify } from "jsonwebtoken";

import application from "../config/application";

import { JwtUser, ServidorRegisterRequestBody, UserLoginRequest, UserRegisterRequest } from "../@types/User";

import auth from "../config/auth";
import CreateHash from "../services/BcryptServices/CreateHash";
import Validate from "../services/BcryptServices/Validate";
import { prisma } from "../shared/database/prisma";
import redis from "../shared/database/redis";
import { logger } from "../shared/utils/logger";
import { generatePdf } from "../utils/generate_pdf";

interface LoginRequest extends Request {
    body: UserLoginRequest;
};

interface RegisterRequest extends Request {
    body: UserRegisterRequest;
}

interface ServidorRegisterRequest extends Request {
    body: ServidorRegisterRequestBody;
};

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
    ///Verifica se o user e password foram enviados
    const { user, senha } = req.body;

    const errorsFields = validationResult(req);

    if (!user || !senha) {

        res.status(401).json({
            status: 401,
            message: "Usuário ou Senha Incorretos",
            ...(application.type === "development" ?
                { data: errorsFields.array() } :
                {}
            )
        });

        return;
    }


    const userDb = await prisma.users.findFirst({
        where: {
            username: user
        }
    });
    ///Verifica se o usuário existe e se está ativo
    if (!userDb || !userDb.isActive) {
        res.status(401).json({
            status: 401,
            message: "Usuário ou Senha Incorretos"
        });
        return;
    }

    //Valida a senha
    if (!userDb.password) {
        res.status(401).json({
            status: 401,
            message: "Usuário não tem permissão para acessar o sistema"
        });
        return;
    }
    const login = await Validate(senha, userDb.password);

    if (login) {

        ///Caso a senha esteja correta
        //Gera o token e envia ao usuário

        const token = sign({
            user: userDb.username || "",
            id: userDb.id,
            nome: userDb.name,
            isSuperAdmin: userDb.isSuperUser || false
        }, auth.secret as string, {
            expiresIn: 86400
        });

        await redis.set(`tokens:${userDb.id}:${token}`, "0", "PX", 86400);

        res.status(200).json({
            status: 200,
            message: "Login realizado",
            data: token
        });
        return;

    } else {
        ////Caso a senha esteja incorreta
        res.status(401).json({
            status: 401,
            message: "Usuário ou Senha Incorretos"
        });
        return;
    };

};

export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
    if (!req.body) {
        res.status(400).json({
            status: 400,
            message: "Dados inválidos"
        });
        return;
    }

    const { name, surname, user, email, password, cpf } = req.body;
    const errorsFields = validationResult(req);

    if (!errorsFields.isEmpty()) {

        res.status(400).json({
            status: 401,
            message: "Campos inválidos",
            ...(application.type === "development" ?
                { data: errorsFields.array() } :
                {}
            )
        });

        return;
    };

    if (!name || !surname || !user || !email || !password || !cpf) {
        res.status(400).json({
            status: 400,
            message: "Todos os campos são obrigatórios"
        });
        return;
    }

    const hash = await CreateHash(password);

    const status = await prisma.users.create({
        data: {
            email,
            username: user,
            name,
            surname,
            password: hash,
            cpf,
        }
    }).then(() => {
        return 1; // Usuário criado com sucesso
    }).catch((error) => {
        logger.error("Erro ao criar usuário:", error);

        if (error.code === "P2002") {
            // Erro de duplicidade, usuário já existe
            return 2; // Usuário já existe
        } else {
            // Outro erro
            return 3; // Erro interno do servidor
        }
    });

    switch (status) {
        case 2:
            res.status(422).json({
                status: 422,
                message: "Usuário já existe"
            });

            break;
        case 3:
            res.status(500).json({
                status: 500,
                message: "Erro interno do servidor"
            });

            break;
        default: {
            res.status(201).json({
                status: 201,
                message: "Usuário criado com sucesso",
            });
            break;
        }
    };

    return;

};

export const registerServidor = async (req: ServidorRegisterRequest, res: Response): Promise<void> => {

    const { name, surname, cpf } = req.body;
    const errorsFields = validationResult(req);

    if (!errorsFields.isEmpty()) {

        res.status(400).json({
            status: 400,
            message: "Campos inválidos",
            ...(application.type === "development" ?
                { data: errorsFields.array() } :
                {}
            )
        });

        return;
    };

    if (!name || !surname || !cpf) {
        res.status(400).json({
            status: 400,
            message: "Todos os campos são obrigatórios"
        });
        return;
    }

    const status = await prisma.users.create({
        data: {
            name,
            surname,
            cpf,
        }
    }).then(() => {
        return 1; // Servidor criado com sucesso
    }).catch((error) => {
        logger.error("Erro ao criar servidor:", error);

        if (error.code === "P2002") {
            // Erro de duplicidade, servidor já existe
            return 2; // Servidor já existe
        } else {
            // Outro erro
            return 3; // Erro interno do servidor
        }
    });

    switch (status) {
        case 2:
            res.status(422).json({
                status: 422,
                message: "Servidor já existe"
            });

            break;
        case 3:
            res.status(500).json({
                status: 500,
                message: "Erro interno do servidor"
            });

            break;
        default: {
            res.status(201).json({
                status: 201,
                message: "Servidor criado com sucesso",
            });
            break;
        }
    };

};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await prisma.users.findMany({
        where: {
            email: {
                not: null
            }
        },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            isActive: true,
            cpf: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(200).json({
        status: 200,
        message: "Lista de usuários carregada com sucesso",
        data: users
    });

    return;
};

export const getAllServidores = async (req: Request, res: Response): Promise<void> => {
    const servidores = await prisma.users.findMany({
        where: {
            email: null
        },
        select: {
            id: true,
            name: true,
            surname: true,
            cpf: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(200).json({
        status: 200,
        message: "Lista de servidores carregada com sucesso",
        data: servidores
    });

    return;
};

export const getAllActiveUsers = async (req: Request, res: Response): Promise<void> => {
    const users = await prisma.users.findMany({
        where: {
            email: {
                not: null
            }
        },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            isActive: true,
            cpf: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(200).json({
        status: 200,
        message: "Lista de usuários ativos carregada com sucesso",
        data: users
    });
    return;
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do usuário não informado"
        });
        return;
    }

    const user = await prisma.users.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            cpf: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
                where: { isEnabled: true },
                select: {
                    id: true,
                    isEnabled: true,
                    permission: {
                        select: {
                            id: true,
                            name: true,
                            routesToRestrict: true,
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        res.status(404).json({
            status: 404,
            message: "Usuário não encontrado"
        });
        return;
    }

    res.status(200).json({
        status: 200,
        message: "Usuário encontrado",
        data: user
    });

    return;
};

export const activeAndInactiveUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do usuário não informado"
        });
        return;
    }

    if (typeof isActive !== "boolean") {
        res.status(400).json({
            status: 400,
            message: "isActive deve ser um booleano"
        });
        return;
    }
    const user = await prisma.users.update({
        where: { id },
        data: { isActive },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!user) {
        res.status(404).json({
            status: 404,
            message: "Usuário não encontrado"
        });
        return;
    }
    res.status(200).json({
        status: 200,
        message: "Usuário atualizado com sucesso",
        data: user
    });
    return;
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, surname, user, email, password, cpf } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do usuário não informado"
        });
        return;
    }

    if (!name || !surname || !user || !email || !cpf) {
        res.status(400).json({
            status: 400,
            message: "Todos os campos são obrigatórios"
        });
        return;
    }

    const hash = password ? await CreateHash(password) : undefined;

    const userDb = await prisma.users.update({
        where: { id },
        data: { name, surname, username: user, email, cpf, ...(hash && { password: hash }) },
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!userDb) {
        res.status(404).json({
            status: 404,
            message: "Usuário não encontrado"
        });
        return;
    }

    res.status(200).json({
        status: 200,
        message: "Usuário atualizado com sucesso",
        data: userDb
    });

    return;
};

export const updateServidor = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, surname, cpf } = req.body;

    if (!id) {
        res.status(400).json({
            status: 400,
            message: "ID do servidor não informado"
        });
        return;
    }

    if (!name || !surname || !cpf) {
        res.status(400).json({
            status: 400,
            message: "Todos os campos são obrigatórios"
        });
        return;
    }

    const servidorDb = await prisma.users.update({
        where: { id },
        data: { name, surname, cpf },
        select: {
            id: true,
            name: true,
            surname: true,
            cpf: true,
            isActive: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!servidorDb) {
        res.status(404).json({
            status: 404,
            message: "Servidor não encontrado"
        });
        return;
    }

    res.status(200).json({
        status: 200,
        message: "Servidor atualizado com sucesso",
        data: servidorDb
    });
    return;
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const authHeader: string = req.headers["x-access-token"] as string;
    const [, token] = authHeader.split(" ");

    ///Captura a expiração do jwt
    const { exp } = verify(token, auth.secret) as JwtUser;

    ///Calcula o tempo restante de expiração do jwt para adionar na expiração do token no redis
    const expiration: number = Math.floor((exp * 1000 - Date.now()) / 1000);
    redis.set("blacklist:" + token, "blacklist:" + token, "EX", expiration);

    res.status(200).json({ message: "Logout realizado" });
};

export const myAccount = async (req: Request, res: Response): Promise<void> => {
    res.sendStatus(200);
    return;
};

type UserUpdateQuery = {
    id: string;
};
interface UserExportRequest extends Request {
    params: UserUpdateQuery;
    query: {
        startDate?: string;
        endDate?: string;
        reportModel?: string;
    };
    // headers: Request["headers"] & CustomHeaders;
}

export const exportPdf = async (req: UserExportRequest, res: Response) => {

    const { id } = req.params;
    const { startDate, endDate, reportModel } = req.query;

    const authHeader = req.headers["x-access-token"] as string | undefined;
    if (!authHeader || typeof authHeader !== "string") {
        res.status(401).json({ message: "Token não informado ou inválido" });
        return;
    }
    const [, token] = authHeader.split(" ");
    const decodedToken = verify(token, auth.secret) as JwtUser;

    if (!decodedToken.isSuperAdmin) {
        res.status(403).json({
            status: 403,
            message: "Você não tem permissão para acessar este recurso"
        });
        return;
    }

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
                relatorio: {
                    OR: [
                        { userId: id },
                        { creatorId: id }
                    ]
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

        const user = await prisma.users.findUnique({
            where: { id: String(id) },
            select: { name: true, email: true }
        });

        const isUser = user?.email !== null ? "Usuário" : "Servidor";

        const buffer = await generatePdf(
            produtos,
            `Relatório de Produtos do ${isUser} "${user?.name || "(Sem nome)"}" ${startDate ? ` de ${new Date(startDate).toLocaleDateString("pt-br")}` : ""}${endDate ? ` até ${new Date(endDate).toLocaleDateString("pt-br")}` : ""}`,
            reportModel || "default"
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=produtos.pdf");
        res.send(buffer);
    } catch (error) {

        res.status(500).json({
            status: 500,
            message: "Erro ao gerar PDF",
            ...(application.type === "development" && { error })
        });
    }

    return;
};

export const switchSuperUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        res.status(404).json({
            status: 404,
            message: "ID não encontrado",
        });
    }

    const userToEdit = await prisma.users.findFirst({
        where: { id }
    });

    prisma.users.update({
        where: { id },
        data: {
            isSuperUser: !userToEdit?.isSuperUser
        }
    }).catch(error => {
        res.status(500).json({
            status: 500,
            message: "Houve um erro ao alterar a permissão do usuário.",
            ...(application.type === "development" && { error })
        });
    });
};