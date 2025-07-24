import { FiEdit, FiTrash, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../AuthContext";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import endpoints from "../../../utils/endpoints";
import { Produtos, ProdutosGetResponse } from "../../../@types/ProdutosRequests";
import ExportModal from "../../../Components/ExportModal/ExportModal";

const ProdutosIndex = () => {

    const {setLoading} = useContext(Context);

    const navigate = useNavigate();
    const [produtos, setProdutos] = useState<Produtos[]>([]);
    const [modalVisible, setModalVisible] = useState(false);

    const requestProdutos = () => {
        setLoading(true);
        api.get(endpoints.produtos.getAll)
            .then(response => {
                const data = response.data as ProdutosGetResponse;
                toast.success(data.message);
                setProdutos(data.data);
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar produtos");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const requestDelete = (id: string) => {
        if(!window.confirm("Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.")) {
            return;
        }

        setLoading(true);
        api.delete(endpoints.produtos.delete(id))
            .then(response => {
                const data = response.data as ProdutosGetResponse;
                toast.success(data.message);
                requestProdutos();
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao excluir produto");
            })
            .finally(() => {
                setLoading(false);
            });
    }

    const exportPdf = (startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.produtos.exportPdf, {
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
        requestProdutos();
    }, []);

    return (
        <div className="container-fluid p-3">
            <h1>Produtos</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3 me-2" onClick={() => navigate("/produtos/create")}>Criar Produto</button>
                <button className="btn btn-success mb-3" onClick={() => setModalVisible(true)}>
                    <FiDownload className="me-2" /> Exportar PDF
                </button>
            </div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th className="w-25">Nome</th>
                        <th className="text-nowrap">Preço</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {produtos.map((produto) => (
                        <tr key={produto.id}>
                            <td>{produto.name}</td>
                            <td>{Number(produto.valor).toLocaleString('pt-br', {
                                style: 'currency',
                                currency: 'BRL'
                            })}</td>
                            <td>{new Date(produto.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(produto.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/produtos/edit/${produto.id}`)}>
                                    <FiEdit />
                                </button>
                                <button className="btn btn-danger" onClick={() => {requestDelete(produto.id)}}>
                                    <FiTrash />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={6} className="text-center">Total de Produtos: {produtos.length}</td>
                    </tr>
                </tfoot>
            </table>
            <ExportModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onExport={(start, end, reportModel) => {
                    exportPdf(start, end, reportModel);
                    setModalVisible(false);
                }}
            />
        </div>
    );

}

export default ProdutosIndex;
