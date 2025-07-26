import { useContext, useEffect, useState } from "react";
import { FiDownload, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Servidor, ServidoresGetResponse } from "../../../@types/ServidoresRequests";
import { Context } from "../../../AuthContext";
import ExportModal from "../../../Components/ExportModal/ExportModal";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

const ServidoresIndex = () => {

    const {setLoading, isSuperAdmin } = useContext(Context)

    const navigate = useNavigate();
    const [servidores, setServidores] = useState<Servidor[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const exportPdf = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.servidores.exportPdf(id), {
            params: { startDate, endDate, reportModel },
            responseType: 'blob'
        })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `servidor-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(() => {
                toast.error('Erro ao exportar servidor');
            })
            .finally(() => setLoading(false));
    };

    const requestServidores = () => {
        setLoading(true);
        api.get(endpoints.servidores.getAll)
            .then(response => {
                const data = response.data as ServidoresGetResponse;
                toast.success(data.message)
                setServidores(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar servidores");
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    useEffect(() => {
        requestServidores();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Servidores</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/servidores/create")}>Cadastrar Servidor</button>
            </div>
            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">CPF</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {servidores.map((servidor) => (
                        <tr key={servidor.id}>
                            <td>{servidor.name}</td>
                            <td>{servidor.cpf}</td>
                            <td>{new Date(servidor.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(servidor.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/servidores/edit/${servidor.id}`)}>
                                    <FiEdit />
                                </button>
                                
                                <button className="btn btn-success" onClick={() => { setExportId(servidor.id); setModalVisible(true); }}>
                                    <FiDownload />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Servidores: {servidores.length}</td>
                    </tr>
                </tfoot>
            </table>
            <ExportModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onExport={(start, end, reportModel) => {
                    if (exportId) {
                        exportPdf(exportId, start, end, reportModel);
                    }
                    setModalVisible(false);
                }}
            />
        </div>
    );

}

export default ServidoresIndex;
