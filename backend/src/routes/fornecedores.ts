import { Router } from "express";
import { create, exportPdf, exportProdutosPdf, getAll, getById, remove, update } from "../controllers/fornecedor.controller";

const fornecedoresRoutes = Router();

fornecedoresRoutes.get("/", getAll);

fornecedoresRoutes.get("/:id", getById);

fornecedoresRoutes.post("/create", create);

fornecedoresRoutes.get("/export/pdf", exportPdf);

fornecedoresRoutes.get("/:id/produtos/export/pdf", exportProdutosPdf);

fornecedoresRoutes.put("/edit/:id", update);

fornecedoresRoutes.delete("/delete/:id", remove);

export default fornecedoresRoutes;