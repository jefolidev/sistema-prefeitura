import { FiEdit, FiTrash, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../AuthContext";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import endpoints from "../../../utils/endpoints";
import { Fornecedores, FornecedoresGetResponse } from "../../../@types/FornecedoresRequests";
import ExportModal from "../../../Components/ExportModal/ExportModal";

const FornecedoresIndex = () => {

    const {setLoading} = useContext(Context)

    const navigate = useNavigate();
    const [fornecedores, setFornecedores] = useState<Fornecedores[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const requestFornecedores = () => {
        setLoading(true);
        api.get(endpoints.fornecedores.getAll)
            .then(response => {
                const data = response.data as FornecedoresGetResponse;
                toast.success(data.message)
                setFornecedores(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar fornecedoreres");
                // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    const requestDelete = (id: string) => {

        if(!window.confirm("Tem certeza que deseja excluir este fornecedor? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        api.delete(endpoints.fornecedores.delete(id))
            .then(response => {
                const data = response.data as FornecedoresGetResponse;
                toast.success(data.message);
                requestFornecedores();
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;

                toast.error(data?.message || "Erro ao excluir fornecedor");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const exportProdutos = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.fornecedores.exportProdutosPdf(id), {
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
        requestFornecedores();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Fornecedores</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/fornecedores/create")}>
                    Criar Fornecedor
                </button>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
                {fornecedores.map((fornecedor) => (
                    <div className="col" key={fornecedor.id}>
                        <div className="card h-100 d-flex flex-column">
                            <div className="card-body d-flex flex-column">
                                <h3 className="card-title">{fornecedor.name}</h3>
                                {fornecedor.cnpj && <p className="mb-1"><strong>CNPJ:</strong> {fornecedor.cnpj}</p>}
                                {fornecedor.razaoSocial && <p className="mb-1"><strong>Razão Social:</strong> {fornecedor.razaoSocial}</p>}
                                {fornecedor.endereco && <p className="mb-1"><strong>Endereço:</strong> {fornecedor.endereco}</p>}
                                {fornecedor.email && <p className="mb-1"><strong>E-mail:</strong> {fornecedor.email}</p>}
                                {fornecedor.telefone && <p className="mb-1"><strong>Telefone:</strong> {fornecedor.telefone}</p>}
                                {fornecedor.observacoes && <p className="mb-1"><strong>Observações:</strong> {fornecedor.observacoes}</p>}
                                <p className="mb-1 text-muted">Criado em {new Date(fornecedor.createdAt).toLocaleString('pt-br')}</p>
                                <p className="mb-3 text-muted">Atualizado em {new Date(fornecedor.updatedAt).toLocaleString('pt-br')}</p>

                                {/* Botões alinhados ao final do card */}
                                <div className="text-end mt-auto">
                                    <button className="btn btn-secondary me-2" onClick={() => navigate(`/fornecedores/edit/${fornecedor.id}`)}>
                                        <FiEdit />
                                    </button>
                                    <button className="btn btn-success me-2" onClick={() => { setExportId(fornecedor.id); setModalVisible(true); }}>
                                        <FiDownload />
                                    </button>
                                    <button className="btn btn-danger" onClick={() => requestDelete(fornecedor.id)}>
                                        <FiTrash />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center mt-3">Total de Fornecedores: {fornecedores.length}</div>
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

export default FornecedoresIndex;
