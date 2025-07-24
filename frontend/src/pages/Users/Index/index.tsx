import { FiEdit, FiDownload } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import { useContext, useEffect, useState } from "react";
import { Context } from "../../../AuthContext";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import endpoints from "../../../utils/endpoints";
import { Users, UsersGetResponse } from "../../../@types/UsersRequests";
import ExportModal from "../../../Components/ExportModal/ExportModal";

const UsersIndex = () => {

    const {setLoading, isSuperAdmin} = useContext(Context)

    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Users[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const exportPdf = (id: string, startDate: string, endDate: string, reportModel: string) => {
        setLoading(true);
        api.get(endpoints.usuarios.exportPdf(id), {
            params: { startDate, endDate, reportModel },
            responseType: 'blob'
        })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `usuario-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(() => {
                toast.error('Erro ao exportar usuário');
            })
            .finally(() => setLoading(false));
    };

    const requestUsuarios = () => {
        setLoading(true);
        api.get(endpoints.usuarios.getAll)
            .then(response => {
                const data = response.data as UsersGetResponse;
                toast.success(data.message)
                setUsuarios(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar usuários");
                // Aqui você pode tratar o erro, como exibir uma mensagem para o usuário
            }
            )
            .finally(() => {
                setLoading(false);
            }
            );
    }

    useEffect(() => {
        requestUsuarios();
    }, [])

    return (
        <div className="container-fluid p-3">
            <h1>Usuários</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/usuarios/create")}>
                    Cadastrar Usuário
                </button>
            </div>
            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">Email</th>
                        <th className="text-nowrap">CPF</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td>{usuario.name}</td>
                            <td>{usuario.email}</td>
                            <td>{usuario.cpf}</td>
                            <td>{new Date(usuario.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(usuario.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/usuarios/edit/${usuario.id}`)}>
                                    <FiEdit />
                                </button>

                                {isSuperAdmin && (
                                    <button className="btn btn-success" onClick={() => { setExportId(usuario.id); setModalVisible(true); }}>
                                        <FiDownload />
                                    </button>
                                    
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Usuários: {usuarios.length}</td>
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

export default UsersIndex;