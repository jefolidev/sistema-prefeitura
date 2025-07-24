import { Router } from "express";
import { create, exportPdf, getAll, getById, remove, update } from "../controllers/GruposControllers";

const gruposRoutes = Router();

gruposRoutes.get("/", getAll);

gruposRoutes.get("/:id", getById);

gruposRoutes.post("/create", create);

gruposRoutes.put("/edit/:id", update);

gruposRoutes.delete("/delete/:id", remove);

gruposRoutes.get("/pdf/:id", exportPdf);

export default gruposRoutes;
