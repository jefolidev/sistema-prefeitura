import { Router } from "express";
import { cancel, create, exportPdf, generateReport, getAll, getById } from "../controllers/requisicao.controller";

const requisicaoRoutes = Router();

requisicaoRoutes.get("/", getAll);
requisicaoRoutes.get("/id/:id", getById);
requisicaoRoutes.get("/pdf/:id", exportPdf);
requisicaoRoutes.get("/export/pdf", generateReport);
requisicaoRoutes.post("/create", create);
requisicaoRoutes.patch("/cancel/:id", cancel);

export default requisicaoRoutes;
