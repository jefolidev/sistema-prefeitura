import { useContext, useEffect, useState } from "react";
import { FiDownload, FiEdit, FiTrash } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Departamentos, DepartamentosGetResponse } from "../../@types/DepartamentosRequests";
import ResponseApiDefault from "../../@types/ResponseApiDefault";
import { Context } from "../../auth-context";
import ExportModal from "../../components/export-modal";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

const DepartamentosIndex = () => {

    const {setLoading} = useContext(Context)

    const navigate = useNavigate();
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const requestDepartamentos = () => {
        setLoading(true);
        api.get("/departamentos")
            .then(response => {
                const data = response.data as DepartamentosGetResponse;
                toast.success(data.message)
                setDepartamentos(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar departamentos");
                // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    const requestDelete = (id: string) => {

        if(!window.confirm("Tem certeza que deseja excluir este departamento? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        api.delete(endpoints.departamentos.delete(id))
            .then(response => {
                const data = response.data as DepartamentosGetResponse;
                toast.success(data.message);
                requestDepartamentos(); // Recarrega a lista de departamentos
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;

                toast.error(data?.message || "Erro ao excluir departamento");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const exportProdutos = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.departamentos.exportProdutosPdf(id), {
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
        requestDepartamentos();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Departamentos</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/departamentos/create")}>
                    Criar Departamento
                </button>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="w-25">Nome</th>
                        <th className="text-nowrap">Responsável</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {departamentos.map((departamento) => (
                        <tr key={departamento.id}>
                            <td>{departamento.name}</td>
                            <td>{departamento.responsavel}</td>
                            <td>{new Date(departamento.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(departamento.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/departamentos/edit/${departamento.id}`)}>
                                    <FiEdit />
                                </button>
                                <button className="btn btn-success me-2" onClick={() => {setExportId(departamento.id); setModalVisible(true);}}>
                                    <FiDownload />
                                </button>
                                <button className="btn btn-danger" onClick={() => {requestDelete(departamento.id)}}>
                                    <FiTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Departamentos: {departamentos.length}</td>
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

export default DepartamentosIndex;