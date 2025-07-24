import { Router } from "express";
import { create, getAll, getById, remove, update, updateRestrictedRoutes } from "../controllers/PermissionsControllers";

const permissionsRoute = Router();

permissionsRoute.get("/", getAll);

permissionsRoute.get("/:id", getById);

permissionsRoute.post("/create", create);

permissionsRoute.patch("/updateScreens/:id", updateRestrictedRoutes);

permissionsRoute.put("/edit/:id", update);

permissionsRoute.delete("/delete/:id", remove);

export default permissionsRoute;
