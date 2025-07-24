import { Router } from "express";
import { activeAndInactiveUser, exportPdf, getAllUsers, getUserById, register, updateServidor, updateUser } from "../controllers/UserControllers";

const funcionariosRoutes = Router();

funcionariosRoutes.get(
    "/",
    getAllUsers
);

funcionariosRoutes.get(
    "/id/:id",
    getUserById
);

funcionariosRoutes.post(
    "/create",
    register
);

funcionariosRoutes.put(
    "/active/:id",
    activeAndInactiveUser
);

funcionariosRoutes.put(
    "/edit/:id", 
    updateUser
);

funcionariosRoutes.put(
    "/edit-servidor/:id",
    updateServidor
);

funcionariosRoutes.get(
    "/pdf/:id",
    exportPdf
);

export default funcionariosRoutes;