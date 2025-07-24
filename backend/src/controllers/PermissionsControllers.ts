import { Request, Response } from "express";

import { PermissoesCreateRequestBody, PermissoesUpdateQuery } from "../@types/Permissoes";
import application from "../config/application";
import { prisma } from "../shared/database/prisma";

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  prisma.permissions.findMany()
    .then(permisssions => {
      res.json({
        status: 200,
        message: "Permissões encontradas com sucesso",
        data: permisssions
      });
    })
    .catch(error => {
      res.status(500).json({
        status: 500,
        message: "Erro ao buscar permissões",
        ...(application.type === "development" && { error })
      });
    });
};

interface PermissoesGetByIdRequest extends Request {
  params: PermissoesUpdateQuery;
}

export const getById = async (req: PermissoesGetByIdRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      status: 400,
      message: "ID da permissão não informado"
    });
    return;
  }

  prisma.permissions.findUnique({
    where: { id: String(id) }
  }).then(permission => {
    if (!permission) {
      res.status(404).json({
        status: 404,
        message: "Permissão não encontrada"
      });
      return;
    }
    res.json({
      status: 200,
      message: "Permissão encontrada com sucesso",
      data: permission
    });
  }).catch(error => {
    res.status(500).json({
      status: 500,
      message: "Erro ao buscar permissão",
      ...(application.type === "development" && { error })
    });
  });
};

interface PermissaoCreateRequest extends Request {
  body: PermissoesCreateRequestBody;
}

export const create = async (req: PermissaoCreateRequest, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({
      status: 400,
      message: "Nome da permissão não informado"
    });
    return;
  }

  if (!description) {
    res.status(400).json({
      status: 400,
      message: "Descrição da permissão não informado"
    });
    return;
  }

  prisma.permissions.create({
    data: { name, description }
  }).then(permission => {
    res.status(201).json({
      status: 201,
      message: "Permissão criada com sucesso",
      data: permission
    });
  }).catch(error => {
    res.status(500).json({
      status: 500,
      message: "Erro ao criar permissão",
      ...(application.type === "development" && { error })
    });
  });
};

interface PermissaoUpdateRequest extends Request {
  params: PermissoesUpdateQuery;
  body: PermissoesCreateRequestBody;
}

export const update = async (req: PermissaoUpdateRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    res.status(400).json({
      status: 400,
      message: "ID da permissão não informado"
    });
    return;
  }

  if (!name) {
    res.status(400).json({
      status: 400,
      message: "Nome da permissão não informado"
    });
    return;
  }

  if (!description) {
    res.status(400).json({
      status: 400,
      message: "Descrição da permissão não informado"
    });
    return;
  }

  prisma.permissions.update({
    where: { id: String(id) },
    data: { name, description }
  }).then(permission => {
    res.json({
      status: 200,
      message: "Permissão atualizada com sucesso",
      data: permission
    });
  }).catch(error => {
    res.status(500).json({
      status: 500,
      message: "Erro ao atualizar permissão",
      ...(application.type === "development" && { error })
    });
  });
};


// interface PermissaoStatusSwitchRequest extends Request {
//   params: PermissoesUpdateQuery;
// }

// export const switchStatus = async (req: PermissaoStatusSwitchRequest, res: Response): Promise<void> => {
//   const { id } = req.params;

//   if (!id) {
//     res.status(400).json({
//       status: 400,
//       message: "ID da permissão não informado"
//     });
//     return;
//   }

// };

interface PermissaoRemoveRequest extends Request {
  params: PermissoesUpdateQuery;
}

export const remove = async (req: PermissaoRemoveRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({
      status: 400,
      message: "ID da permissão não informado"
    });
    return;
  }

  prisma.permissions.delete({
    where: { id: String(id) }
  }).then(() => {
    res.json({
      status: 200,
      message: "Permissão removida com sucesso"
    });
  }).catch(error => {
    res.status(500).json({
      status: 500,
      message: "Erro ao remover permissão",
      ...(application.type === "development" && { error })
    });
  });
};
