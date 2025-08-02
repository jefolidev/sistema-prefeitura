import { useContext, useEffect, useState } from "react";
import { FiDownload, FiEdit, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Secretarias, SecretariasGetResponse } from "../../../@types/SecretariasRequests";
import { Context } from "../../auth-context";
import ExportModal from "../../components/export-modal/export-modal";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

const SecretariasIndex = () => {

    const {setLoading} = useContext(Context)

    const navigate = useNavigate();
    const [secretarias, setSecretarias] = useState<Secretarias[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const requestSecretarias = () => {
        setLoading(true);
        api.get(endpoints.secretarias.getAll)
            .then(response => {
                const data = response.data as SecretariasGetResponse;
                toast.success(data.message)
                setSecretarias(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar secretarias");
                // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    const requestDelete = (id: string) => {

        if(!window.confirm("Tem certeza que deseja excluir esta secretaria? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        api.delete(endpoints.secretarias.delete(id))
            .then(response => {
                const data = response.data as SecretariasGetResponse;
                toast.success(data.message);
                requestSecretarias(); // Recarrega a lista de secretarias
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;

                toast.error(data?.message || "Erro ao excluir secretaria");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const exportProdutos = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.secretarias.exportProdutosPdf(id), {
            params: { startDate, endDate, reportModel },
            responseType: 'blob'
        })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'produtos.pdf');
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(() => {
                toast.error('Erro ao exportar produtos');
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        requestSecretarias();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Secretarias</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/secretarias/create")}>
                    Criar Secretaria
                </button>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="w-50">Nome</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {secretarias.map((secretaria) => (
                        <tr key={secretaria.id}>
                            <td>{secretaria.name}</td>
                            <td>{new Date(secretaria.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(secretaria.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/secretarias/edit/${secretaria.id}`)}>
                                    <FiEdit />
                                </button>
                                <button className="btn btn-success me-2" onClick={() => {setExportId(secretaria.id); setModalVisible(true);}}>
                                    <FiDownload />
                                </button>
                                <button className="btn btn-danger" onClick={() => {requestDelete(secretaria.id)}}>
                                    <FiTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Secretarias: {secretarias.length}</td>
                    </tr>
                </tfoot>
            </table>
            <ExportModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onExport={(start, end, reportModel) => {
                    if (exportId) {
                        exportProdutos(exportId, start, end, reportModel);
                    }
                    setModalVisible(false);
                }}
            />
        </div>
    );

}

export default SecretariasIndex;