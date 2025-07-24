import { FiEdit, FiTrash, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../AuthContext";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import endpoints from "../../../utils/endpoints";
import { Grupos, GruposGetResponse } from "../../../@types/GruposRequests";
import ExportModal from "../../../Components/ExportModal/ExportModal";

const GruposIndex = () => {

    const {setLoading} = useContext(Context)

    const navigate = useNavigate();
    const [grupos, setGrupos] = useState<Grupos[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const requestGrupos = () => {
        setLoading(true);
        api.get(endpoints.grupos.getAll)
            .then(response => {
                const data = response.data as GruposGetResponse;
                toast.success(data.message)
                setGrupos(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar grupos");
                // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    const requestDelete = (id: string) => {

        if(!window.confirm("Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        api.delete(endpoints.grupos.delete(id))
            .then(response => {
                const data = response.data as GruposGetResponse;
                toast.success(data.message);
                requestGrupos(); // Recarrega a lista de grupos
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;

                toast.error(data?.message || "Erro ao excluir grupo");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const exportProdutos = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.grupos.exportProdutosPdf(id), {
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
        requestGrupos();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Grupos</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/grupos/create")}>
                    Criar Grupo
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
                    {grupos.map((grupo) => (
                        <tr key={grupo.id}>
                            <td>{grupo.name}</td>
                            <td>{new Date(grupo.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(grupo.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/grupos/edit/${grupo.id}`)}>
                                    <FiEdit />
                                </button>
                                <button className="btn btn-success me-2" onClick={() => {setExportId(grupo.id); setModalVisible(true);}}>
                                    <FiDownload />
                                </button>
                                <button className="btn btn-danger" onClick={() => {requestDelete(grupo.id)}}>
                                    <FiTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Grupos: {grupos.length}</td>
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

export default GruposIndex;