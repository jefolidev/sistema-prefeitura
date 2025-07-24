import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { UserPermissions, UserPermissionsGetResponse } from "../../../@types/UserPermissions";
import { Context } from "../../../AuthContext";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export function UserPermissionsManager() {
    const { setLoading } = useContext(Context)
    
    const [permissoes, setPermissoes] = useState<UserPermissions[]>([]);
    const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        if (!id) {
            toast.error("ID do Usuário não fornecido.");
            navigate("/usuarios");
            return;
        }
        requestUserPermission();
    }, [id, navigate]);

    if (!id) return null;

    const requestUserPermission = () => {
        setLoading(true);
        api.get(endpoints.permissoesUsuario.getUserPermissionsById(id))
            .then(response => {
                const data = response.data as UserPermissionsGetResponse;
                toast.success(data.message);

                setPermissoes(data.data);

                const enabledMap: Record<string, boolean> = {};
                data.data.forEach(p => {
                    enabledMap[p.id] = p.isEnabled;
                });
                setUserPermissions(enabledMap);
            })
            .catch(error => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao buscar usuários");
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    const togglePermissao = (permissionId: string) => {
        if (!id) return;

        api.patch(endpoints.permissoesUsuario.switchStatus, {
            userId: id,
            permissionId
        }).then(response => {
            const msg = response.data?.message;
            toast.success(msg || "Permissão atualizada");

            setPermissoes(prev =>
                prev.map(p =>
                    p.id === permissionId ? { ...p, isEnabled: !p.isEnabled } : p
                )
            );

            setUserPermissions(prev => ({
                ...prev,
                [permissionId]: !prev[permissionId],
            }));
        }).catch(error => {
            const data = error.response?.data as ResponseApiDefault;
            toast.error(data?.message || "Erro ao alternar permissão");
        });
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between mb-3">
                <h2>Permissões</h2>
                <a className="" onClick={() => navigate(`/permissoes`)}>Gerenciar permissões</a>
            </div>

            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">Descrição</th>
                        <th className="text-nowrap">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {permissoes.map(permissao => (
                        <tr key={permissao.id}>
                            <td>{permissao.name}</td>
                            <td>{permissao.description}</td>
                            
                            <td>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={userPermissions[permissao.id] || false}
                                        onChange={() => togglePermissao(permissao.id)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300" />
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
