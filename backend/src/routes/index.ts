import { Router } from "express";

import isAuth from "../shared/middlewares/isAuth";
import departamentosRoutes from "./departamentos";
import fornecedoresRoutes from "./fornecedores";
import funcionariosRoutes from "./funcionarios";
import gruposRoutes from "./grupos";
import permissionsRoute from "./permissoes";
import produtosRoutes from "./produtos";
import requisicaoRoutes from "./requisicao";
import userRoutes from "./user";
import userPermissionsRoute from "./user-permission";

const routes = Router();

routes.use("/user", isAuth, userRoutes);
routes.use("/departamentos", isAuth, departamentosRoutes);
routes.use("/fornecedores", isAuth, fornecedoresRoutes);
routes.use("/produtos", isAuth, produtosRoutes);
routes.use("/funcionarios", isAuth, funcionariosRoutes);
routes.use("/requisicao", isAuth, requisicaoRoutes);
routes.use("/grupos", isAuth, gruposRoutes);
routes.use("/permissoes", isAuth, permissionsRoute);
routes.use("/permissoesUsuario", isAuth, userPermissionsRoute);


export default routes;