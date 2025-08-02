import { useContext, useEffect, useState } from "react";
import { FiDownload, FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../@types/ResponseApiDefault";
import { Users, UsersGetResponse } from "../../@types/UsersRequests";
import { Context } from "../../auth-context";
import ExportModal from "../../components/export-modal";
import { useUser } from "../../context/user-context";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

const UsersIndex = () => {

    const {setLoading, isSuperAdmin} = useContext(Context)

    const navigate = useNavigate();
    const [usuarios, setUsuarios] = useState<Users[]>([]);
    const [exportId, setExportId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const { user } = useUser()
    const isSuperUser = user?.isSuperUser


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

    const requestUsuarios = async () => {
        setLoading(true);
        await api.get(endpoints.usuarios.getAll)
            .then(response => {
                const data = response.data as UsersGetResponse;
                toast.success(data.message)
                setUsuarios(data.data);
            }
            )
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar usuários");
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

    const toggleSuperUser = async (id: string) => {
        const currentUserId = localStorage.getItem("userId");
        const isCurrentUserSuper = localStorage.getItem("isSuperAdmin");

        setLoading(true);

        await api.patch(endpoints.usuarios.toggleSuperUser(id))
            .then(res => {
                const data = res.data as UsersGetResponse;

                if (currentUserId === id) {
                    const updatedValue = isCurrentUserSuper === "true" ? "false" : "true";
                    localStorage.setItem("isSuperAdmin", updatedValue);
                }

                setUsuarios(prevUsuarios =>
                    prevUsuarios.map((user) =>
                        user.id === id ? { ...user, isSuperUser: !user.isSuperUser } : user
                    )
                );

                toast.success(data.message);
            }).catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar usuários");
            }).finally(() => {
                setLoading(false);
                requestUsuarios();
            })        
    };


    return (
        <div className="container-fluid p-3">
            <h1>Usuários</h1>
            <div className="mt-3">
                {isSuperAdmin && <button className="btn btn-primary mb-3" onClick={() => navigate("/usuarios/create")}>
                    Cadastrar Usuário
                </button>}
            </div>
            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">Email</th>
                        <th className="text-nowrap">CPF</th>
                        <th className="text-nowrap">Criado em</th>
                        <th className="text-nowrap">Atualizado em</th>
                        {isSuperUser && <th className="text-nowrap">Super usuario</th>}
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
                            {isSuperAdmin && <td>  
                                <input
                                    type="checkbox"
                                    checked={usuario.isSuperUser}
                                    onChange={() => toggleSuperUser(usuario.id)}
                                    className="sr-only peer"
                                />
                            </td>}
                            <td>
                                {isSuperAdmin && (
                                    <>
                                        <button className="btn btn-secondary me-2" onClick={() => navigate(`/usuarios/edit/${usuario.id}`)}>
                                            <FiEdit />
                                        </button>

                                        <button className="btn btn-success" onClick={() => { setExportId(usuario.id); setModalVisible(true); }}>
                                            <FiDownload />
                                        </button>
                                    </>
                                    
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={7} className="text-center">Total de Usuários: {usuarios.length}</td>
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