import { Router } from "express";
import { getAll, getUserPermissionsById, switchUsuarioStatus } from "../controllers/UserPermissionsController";

const userPermissionsRoute = Router();

userPermissionsRoute.get("/", getAll);

userPermissionsRoute.get("/:id", getUserPermissionsById);

userPermissionsRoute.patch("/switchStatus/:id", switchUsuarioStatus);

export default userPermissionsRoute;
