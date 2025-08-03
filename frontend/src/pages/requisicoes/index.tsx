import { useContext, useEffect, useState } from "react";
import { FiDownload, FiEye, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Relatorio, RelatoriosGetResponse } from "../../@types/RelatoriosRequests";
import ResponseApiDefault from "../../@types/ResponseApiDefault";
import { Context } from "../../auth-context";
import { Button } from "../../components/button";
import { RequisitionModal } from "../../components/requisition-modal";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

const RelatoriosIndex = () => {
    const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const navigate = useNavigate();

    const { setLoading } = useContext(Context);
    

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
                <Button color="primary" className="mb-3" label="Criar Requisição" icon={<FiPlus />} onClick={() => navigate("/requisicoes/create")}/> 
                <Button
                    label="Gerar relatorio"
                    className={"mx-3 mb-3"}
                    variant="outline"
                    icon={<FiDownload/>}
                    onClick={() => setModalVisible(true)}
                />
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
            <RequisitionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
            />
        </div>
    );
};

export default RelatoriosIndex;
