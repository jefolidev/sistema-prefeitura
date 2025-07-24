import { Router } from "express";

import userRoutes from "./user";
import departamentosRoutes from "./departamentos";
import fornecedoresRoutes from "./fornecedores";
import produtosRoutes from "./produtos";
import funcionariosRoutes from "./funcionarios";
import requisicaoRoutes from "./requisicao";
import gruposRoutes from "./grupos";
import isAuth from "../shared/middlewares/isAuth";

const routes = Router();

routes.use("/user", isAuth, userRoutes);
routes.use("/departamentos", isAuth, departamentosRoutes);
routes.use("/fornecedores", isAuth, fornecedoresRoutes);
routes.use("/produtos", isAuth, produtosRoutes);
routes.use("/funcionarios", isAuth, funcionariosRoutes);
routes.use("/requisicao", isAuth, requisicaoRoutes);
routes.use("/grupos", isAuth, gruposRoutes);


export default routes;