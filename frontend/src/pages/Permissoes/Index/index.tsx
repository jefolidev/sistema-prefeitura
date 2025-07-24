import { useContext, useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Permissions, PermissionsGetResponse } from "../../../@types/PermissoesRequests";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Context } from "../../../AuthContext";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export function PermissoesIndex() {
    const [permissoes, setPermissoes] = useState<Permissions[]>([])
    const {setLoading} = useContext(Context)
    
    const navigate = useNavigate();

    const requestPermissoes = () => {
        setLoading(true)
        api.get(endpoints.permissoes.getAll).then(response => {
            const {data, message} = response.data as PermissionsGetResponse
            toast.success(message)
            setPermissoes(data)
        }).catch(error => {
            const { message } = error.response?.data as ResponseApiDefault
            toast.error(message || "Erro ao buscar permissões")
        }).finally(() => {
            setLoading(false)
        })
    }

    useEffect(() => requestPermissoes(), [])


    return (
        <div className="container-fluid p-3">
            <h1>Permissões</h1>
            <div className="mt-3">
                <button className="btn btn-primary mb-3" onClick={() => navigate("/permissoes/create")}>
                    Cadastrar permissão
                </button>
            </div>
            <table className="table table-striped text-lg">
                <thead>
                    <tr>
                        <th className="text-nowrap">Nome</th>
                        <th className="text-nowrap">Descricao</th>
                        <th className="text-end text-nowrap"></th>
                    </tr>
                </thead>
                <tbody>
                    {permissoes.map((permissao) => (
                        <tr key={permissao.id}>
                            <td>{permissao.name}</td>
                            <td>{permissao.description}</td>
                            <td>{new Date(permissao.createdAt).toLocaleString('pt-br')}</td>
                            <td>{new Date(permissao.updatedAt).toLocaleString('pt-br')}</td>
                            <td>
                                <button className="btn btn-secondary me-2" onClick={() => navigate(`/permissoes/edit/${permissao.id}`)}>
                                    <FiEdit />
                                </button>

                                
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={5} className="text-center">Total de Permissões: <strong>{permissoes.length}</strong></td>
                    </tr>
                </tfoot>
            </table>
         
        </div>
    );

}