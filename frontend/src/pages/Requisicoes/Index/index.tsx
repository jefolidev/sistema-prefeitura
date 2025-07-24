import { FiPlus, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../AuthContext";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Relatorio, RelatoriosGetResponse } from "../../../@types/RelatoriosRequests";

const RelatoriosIndex = () => {
    const navigate = useNavigate();
    const { setLoading } = useContext(Context);
    const [relatorios, setRelatorios] = useState<Relatorio[]>([]);

    const requestRelatorios = () => {
        setLoading(true);
        api.get(endpoints.relatorios.getAll)
            .then(res => {
                const data = res.data as RelatoriosGetResponse;
                setRelatorios(data.data);
                toast.success(data.message);
            })
            .catch(err => {
                const data = err.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar relatórios");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        requestRelatorios();
    }, []);

    return (
        <div className="container-fluid p-3">
            <h1>Requisição</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/requisicoes/create")}> 
                    <FiPlus className="me-2" />Criar Requisição
                </button>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Fornecedor</th>
                        <th>Usuário</th>
                        <th>Criado em</th>
                        <th className="text-end"></th>
                    </tr>
                </thead>
                <tbody>
                    {relatorios.map(r => (
                        <tr key={r.id}>
                            <td>{String(r.seq).padStart(7, "0")}</td>
                            <td>{r.fornecedor.name}</td>
                            <td>{r.user.name}</td>
                            <td>{new Date(r.createdAt).toLocaleString('pt-br')}</td>
                            <td className="text-end">
                                <button className="btn btn-secondary" onClick={() => navigate(`/requisicoes/view/${r.id}`)}>
                                    <FiEye />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="text-center">Total de Relatórios: {relatorios.length}</div>
        </div>
    );
};

export default RelatoriosIndex;
