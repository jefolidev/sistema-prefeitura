import { Router } from "express";
import { create, getAll, getById, cancel, exportPdf } from "../controllers/requisicao.controller";

const requisicaoRoutes = Router();

requisicaoRoutes.get("/", getAll);
requisicaoRoutes.get("/id/:id", getById);
requisicaoRoutes.get("/pdf/:id", exportPdf);
requisicaoRoutes.post("/create", create);
requisicaoRoutes.patch("/cancel/:id", cancel);

export default requisicaoRoutes;
