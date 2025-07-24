import { Request, Response } from "express";

import { UserPermissionsGetQuery, UserPermissionsSwitchStatusQuery } from "../@types/Permissoes";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  prisma.permissions.findMany()
    .then(userPermissions => {
      res.json({
        status: 200,
        message: "Permissões dos usários encontradas com sucesso",
        data: userPermissions
      });
    })
    .catch(error => {
      res.status(500).json({
        status: 500,
        message: "Erro ao buscar permissões dos usuários",
        ...(application.type === "development" && { error })
      });
    });
};

interface UserPermissoesGetByIdRequest extends Request {
  params: UserPermissionsGetQuery;
}

export const getUserPermissionsById = async (req: UserPermissoesGetByIdRequest, res: Response): Promise<void> => {
  const { id: userId } = req.params;
  console.log("id no back: ", userId);
  if (!userId) {
    res.status(400).json({
      status: 400,
      message: "ID do usuário não informado"
    });
    return;
  }

  try {
    const permissions = await prisma.permissions.findMany({
      include: {
        users: {
          where: { userId },
          select: { isEnabled: true }
        }
      }
    });

    const mapped = permissions.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isEnabled: p.users[0]?.isEnabled ?? false
    }));

    res.json({
      status: 200,
      message: "Permissões do usuário retornadas com sucesso",
      data: mapped
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro ao buscar permissões do usuário",
      ...(application.type === "development" && { error })
    });
  }
};

interface UserPermissaoSwitchRequest extends Request {
  body: UserPermissionsSwitchStatusQuery;
}

export const switchUsuarioStatus = async (req: UserPermissaoSwitchRequest, res: Response): Promise<void> => {
  const { userId, permissionId } = req.body;

  try {
    const existing = await prisma.userPermissions.findUnique({
      where: {
        userId_permissionId: { userId, permissionId }
      }
    });

    if (!existing) {
      const created = await prisma.userPermissions.create({
        data: {
          userId,
          permissionId,
          isEnabled: true
        }
      });

      res.json({
        status: 201,
        message: "Permissão ativada com sucesso",
        data: created
      });
    } else {
      const updated = await prisma.userPermissions.update({
        where: {
          userId_permissionId: { userId, permissionId }
        },
        data: {
          isEnabled: !existing.isEnabled
        }
      });

      res.json({
        status: 200,
        message: `Permissão ${updated.isEnabled ? "ativada" : "desativada"} com sucesso`,
        data: updated
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Erro ao alternar permissão",
      ...(application.type === "development" && { error })
    });
  }
};
