import React, { useContext, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../AuthContext";
import Header from "../Components/Header/Header";
import Sidebar from "../Components/Sidebar/Sidebar";
import Dashboard from "../pages/Dashboard/Dashboard";
import { CreateDepartamentoPage } from "../pages/Departamentos/Create";
import { EditDepartamentoPage } from "../pages/Departamentos/Edit";
import DepartamentosIndex from "../pages/Departamentos/Index";
import { CreateFornecedoresPage } from "../pages/Fornecedores/Create";
import { EditFornecedorPage } from "../pages/Fornecedores/Edit";
import FornecedoresIndex from "../pages/Fornecedores/Index";
import { CreateGruposPage } from "../pages/Grupos/Create";
import { EditGruposPage } from "../pages/Grupos/Edit";
import GruposIndex from "../pages/Grupos/Index";
import { CreatePermissoesPage } from "../pages/Permissoes/Create";
import { PermissoesIndex } from "../pages/Permissoes/Index";
import { CreateProdutosPage } from "../pages/Produtos/Create";
import { EditProdutoPage } from "../pages/Produtos/Edit";
import ProdutosIndex from "../pages/Produtos/Index";
import { CreateRelatorioPage } from "../pages/Requisicoes/Create";
import RelatoriosIndex from "../pages/Requisicoes/Index";
import ViewRelatorioPage from "../pages/Requisicoes/View";
import { CreateServidorPage } from "../pages/Servidores/Create";
import { EditServidorPage } from "../pages/Servidores/Edit";
import ServidoresIndex from "../pages/Servidores/Index";
import { CreateUsuariosPage } from "../pages/Users/Create";
import { EditUsuarioPage } from "../pages/Users/Edit";
import UsersIndex from "../pages/Users/Index";
import api from "../utils/api";
import endpoints from "../utils/endpoints";

const AuthenticatedRoutes:React.FC = () => {

    const { setLoading } = useContext(Context);

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
            <BrowserRouter>
                <div className="d-flex" style={{height: "100vh"}}>
                    <div className="col-auto">
                        <Sidebar />
                    </div>
                    <div className="col">
                        <Header />
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/departamentos">
                                <Route index element={<DepartamentosIndex />}/>
                                <Route path="create" element={<CreateDepartamentoPage />}/>
                                <Route path="edit/:id" element={<EditDepartamentoPage />}/>
                            </Route>
                            <Route path="/fornecedores">
                                <Route index element={<FornecedoresIndex />}/>
                                <Route path="create" element={<CreateFornecedoresPage />}/>
                                <Route path="edit/:id" element={<EditFornecedorPage />}/>
                            </Route>
                            <Route path="/produtos">
                                <Route index element={<ProdutosIndex />}/>
                                <Route path="create" element={<CreateProdutosPage />}/>
                                <Route path="edit/:id" element={<EditProdutoPage />}/>
                            </Route>
                            <Route path="/grupos">
                                <Route index element={<GruposIndex />}/>
                                <Route path="create" element={<CreateGruposPage />}/>
                                <Route path="edit/:id" element={<EditGruposPage />}/>
                            </Route>
                            <Route path="/requisicoes">
                                <Route index element={<RelatoriosIndex />}/>
                                <Route path="create" element={<CreateRelatorioPage />}/>
                                <Route path="view/:id" element={<ViewRelatorioPage />}/>
                            </Route>
                            <Route path="/servidores">
                                <Route index element={<ServidoresIndex />}/>
                                <Route path="create" element={<CreateServidorPage />}/>
                                <Route path="edit/:id" element={<EditServidorPage />}/>
                            </Route>
                            <Route path="/usuarios">
                                <Route index element={<UsersIndex />}/>
                                <Route path="create" element={<CreateUsuariosPage />}/>
                                <Route path="edit/:id" element={<EditUsuarioPage />}/>
                            </Route>
                            <Route path="/permissoes">
                                <Route index element={<PermissoesIndex />}/>
                                <Route path="create" element={<CreatePermissoesPage />}/>
                                {/* <Route path="edit/:id" element={<EditUsuarioPage />}/> */}
                            </Route>
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </div>
                
                </div>
            </BrowserRouter>
        </>
    )
}

export default AuthenticatedRoutes;