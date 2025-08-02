import React, { useContext, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { toast } from "react-toastify";
import { Telas } from "../@types/Telas";
import { Context } from "../auth-context";
import Header from "../components/header/header";
import Sidebar from "../components/sidebar/sidebar";
import Dashboard from "../pages/dashboard/dashboard";
import { CreateDepartamentoPage } from "../pages/departamentos/create";
import { EditDepartamentoPage } from "../pages/departamentos/edit";
import DepartamentosIndex from "../pages/departamentos/index";
import { CreateFornecedoresPage } from "../pages/fornecedores/create";
import { EditFornecedorPage } from "../pages/fornecedores/edit";
import FornecedoresIndex from "../pages/fornecedores/index";
import { CreateGruposPage } from "../pages/grupos/create";
import { EditGruposPage } from "../pages/grupos/edit";
import GruposIndex from "../pages/grupos/index";
import { CreatePermissoesPage } from "../pages/permissoes/create";
import { EditPermissaoPage } from "../pages/permissoes/edit";
import { PermissoesIndex } from "../pages/permissoes/index";
import { CreateProdutosPage } from "../pages/produtos/create";
import { EditProdutoPage } from "../pages/produtos/edit";
import ProdutosIndex from "../pages/produtos/index";
import { CreateRelatorioPage } from "../pages/requisicoes/create";
import RelatoriosIndex from "../pages/requisicoes/index";
import ViewRelatorioPage from "../pages/requisicoes/view";
import { CreateServidorPage } from "../pages/servidores/create";
import { EditServidorPage } from "../pages/servidores/edit";
import ServidoresIndex from "../pages/servidores/index";
import { CreateUsuariosPage } from "../pages/users/create";
import { EditUsuarioPage } from "../pages/users/edit";
import UsersIndex from "../pages/users/index";
import api from "../utils/api";
import endpoints from "../utils/endpoints";

const AuthenticatedRoutes:React.FC = () => {
    const { setLoading } = useContext(Context);
    const { isSuperAdmin } = useContext(Context)

    useEffect(() => {
        setLoading(true);

        api.post(endpoints.user.myAccount).then(() => {
            setLoading(false);
        }).catch(() => {
            toast.error("Erro ao tentar carregar dados do usuário");
        });
    }, [setLoading]);

    return (
        <>
            <div className="d-flex" style={{height: "100vh"}}>
                <div className="col-auto">
                    <Sidebar />
                </div>
                <div className="col">
                    <Header />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path={Telas.DEPARTAMENTOS}>
                            <Route index element={<DepartamentosIndex />}/>
                            <Route path="create" element={<CreateDepartamentoPage />}/>
                            <Route path="edit/:id" element={<EditDepartamentoPage />}/>
                        </Route>
                        <Route path={Telas.FORNECEDORES}>
                            <Route index element={<FornecedoresIndex />}/>
                            <Route path="create" element={<CreateFornecedoresPage />}/>
                            <Route path="edit/:id" element={<EditFornecedorPage />}/>
                        </Route>
                        <Route path={Telas.PRODUTOS}>
                            <Route index element={<ProdutosIndex />}/>
                            <Route path="create" element={<CreateProdutosPage />}/>
                            <Route path="edit/:id" element={<EditProdutoPage />}/>
                        </Route>
                        <Route path={Telas.GRUPOS}>
                            <Route index element={<GruposIndex />}/>
                            <Route path="create" element={<CreateGruposPage />}/>
                            <Route path="edit/:id" element={<EditGruposPage />}/>
                        </Route>
                        <Route path={Telas.REQUISICOES}>
                            <Route index element={<RelatoriosIndex />}/>
                            <Route path="create" element={<CreateRelatorioPage />}/>
                            <Route path="view/:id" element={<ViewRelatorioPage />}/>
                        </Route>
                        <Route path={Telas.SERVIDORES}>
                            <Route index element={<ServidoresIndex />}/>
                            <Route path="create" element={<CreateServidorPage />}/>
                            <Route path="edit/:id" element={<EditServidorPage />}/>
                        </Route>
                        <Route path={Telas.USUARIOS}>
                            <Route index element={<UsersIndex />}/>
                            <Route path="create" element={<CreateUsuariosPage />}/>
                            <Route path="edit/:id" element={<EditUsuarioPage />}/>
                        </Route>
                        {isSuperAdmin &&
                        <Route path={Telas.PERMISSOES}>
                            <Route index element={<PermissoesIndex />}/>
                            <Route path="create" element={<CreatePermissoesPage />}/>
                            <Route path="edit/:id" element={<EditPermissaoPage />}/>
                        </Route>}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
                
            </div>
        </>
    )
}

export default AuthenticatedRoutes;