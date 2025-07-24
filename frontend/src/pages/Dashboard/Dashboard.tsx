import { useContext, useEffect, useState } from "react";
import { Context } from "../../AuthContext";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";
import { toast } from "react-toastify";
import { FiTruck, FiPackage } from "react-icons/fi";
import { FaUserTie, FaSitemap } from "react-icons/fa";

interface Counts {
    fornecedores: number;
    usuarios: number;
    produtos: number;
    departamentos: number;
}

const Dashboard = () => {
    const { setLoading } = useContext(Context);

    const [counts, setCounts] = useState<Counts>({
        fornecedores: 0,
        usuarios: 0,
        produtos: 0,
        departamentos: 0,
    });

    useEffect(() => {
        const fetchCounts = async () => {
            setLoading(true);
            try {
                const [
                    fornecedoresRes,
                    usuariosRes,
                    produtosRes,
                    departamentosRes,
                ] = await Promise.all([
                    api.get(endpoints.fornecedores.getAll),
                    api.get(endpoints.usuarios.getAll),
                    api.get(endpoints.produtos.getAll),
                    api.get(endpoints.departamentos.getAll),
                ]);

                setCounts({
                    fornecedores: (fornecedoresRes.data.data || []).length,
                    usuarios: (usuariosRes.data.data || []).length,
                    produtos: (produtosRes.data.data || []).length,
                    departamentos: (departamentosRes.data.data || []).length,
                });
            } catch (error) {
                console.error("Erro ao carregar dados do dashboard:", error);
                toast.error("Erro ao carregar dados do dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, [setLoading]);

    return (
        <div className="container-fluid p-3">
            <h1>Dashboard</h1>
            <div className="row mt-4 g-3">
                <div className="col-md-4">
                    <div className="card text-bg-primary h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiTruck className="fs-1 me-3" />
                            <div>
                                <h5 className="card-title">Fornecedores</h5>
                                <p className="card-text fs-3 mb-0">{counts.fornecedores}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-bg-secondary h-100">
                        <div className="card-body d-flex align-items-center">
                            <FaUserTie className="fs-1 me-3" />
                            <div>
                                <h5 className="card-title">Usuários</h5>
                                <p className="card-text fs-3 mb-0">{counts.usuarios}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-bg-warning h-100">
                        <div className="card-body d-flex align-items-center">
                            <FiPackage className="fs-1 me-3" />
                            <div>
                                <h5 className="card-title">Produtos</h5>
                                <p className="card-text fs-3 mb-0">{counts.produtos}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-bg-info h-100">
                        <div className="card-body d-flex align-items-center">
                            <FaSitemap className="fs-1 me-3" />
                            <div>
                                <h5 className="card-title">Departamentos</h5>
                                <p className="card-text fs-3 mb-0">{counts.departamentos}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;