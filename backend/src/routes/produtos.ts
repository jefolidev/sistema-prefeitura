import { Router } from "express";
import { create, getAll, getById, remove, update, exportPdf } from "../controllers/ProdutosControllers";

const produtosRoutes = Router();

produtosRoutes.get("/", getAll);

produtosRoutes.get("/:id", getById);

produtosRoutes.post("/create", create);

produtosRoutes.get("/export/pdf", exportPdf);

produtosRoutes.put("/edit/:id", update);

produtosRoutes.delete("/delete/:id", remove);

export default produtosRoutes;
