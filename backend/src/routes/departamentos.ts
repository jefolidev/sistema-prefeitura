import { Router } from "express";
import { create, exportPdf, getAll, getById, remove, update } from "../controllers/DepartamentosControllers";

const departamentosRoutes = Router();

departamentosRoutes.get("/", getAll);

departamentosRoutes.get("/id/:id", getById);

departamentosRoutes.post("/create", create);

departamentosRoutes.put("/edit/:id", update);

departamentosRoutes.delete("/delete/:id", remove);

departamentosRoutes.get("/pdf/:id", exportPdf);

export default departamentosRoutes;