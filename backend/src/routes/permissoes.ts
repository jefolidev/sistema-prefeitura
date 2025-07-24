import { Router } from "express";
import { create, getAll, getById, remove, update } from "../controllers/PermissionsControllers";

const permissionsRoute = Router();

permissionsRoute.get("/", getAll);

permissionsRoute.get("/:id", getById);

permissionsRoute.post("/create", create);

permissionsRoute.put("/edit/:id", update);

permissionsRoute.delete("/delete/:id", remove);

export default permissionsRoute;
