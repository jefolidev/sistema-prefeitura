import { CFormInput } from "@coreui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate, useParams } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { GruposGetByIdResponse } from "../../../@types/GruposRequests";
import axios from "axios";

export const EditGruposPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [name, setName] = useState("");

    useEffect(() => {

        if(!id) {
            toast.error("ID do Grupo não fornecido.");
            navigate("/grupos");
            return;
        }
        // Função para buscar os dados do grupo
        const fetchGrupo = async () => {
            try {
                const response = await api.get(endpoints.grupos.getById(id));
                const data = response.data as GruposGetByIdResponse;
                setName(data?.data?.name || "");
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as GruposGetByIdResponse;
                    toast.error(data?.message || "Erro ao buscar grupo");
                } else {
                    toast.error("Erro desconhecido ao buscar grupo");
                }
                navigate("/grupos");
            }
        };

        fetchGrupo();
    }, [])

    if (!id) {
        return
    }

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome do Grupo.");
            return;
        }

        api.put(endpoints.grupos.update(id), { name })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Grupo editado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/grupos"); // Redireciona para a lista de grupos
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;

                toast.error(data.message || "Erro ao editar Grupo. Tente novamente.");

            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Editar Grupo</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome do Grupo"
                        placeholder="Digite o nome do Grupo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <button className="btn btn-primary mt-3" type="submit">
                        Editar Grupo
                    </button>
                </div>
            </form>
        </div>
    );
}