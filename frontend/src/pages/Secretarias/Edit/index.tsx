import { CFormInput } from "@coreui/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate, useParams } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { SecretariasGetByIdResponse } from "../../../@types/SecretariasRequests";
import axios from "axios";

export const EditSecretariaPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [name, setName] = useState("");

    useEffect(() => {

        if(!id) {
            toast.error("ID da Secretaria não fornecido.");
            navigate("/secretarias");
            return;
        }
        // Função para buscar os dados da secretaria
        const fetchSecretaria = async () => {
            try {
                const response = await api.get(endpoints.secretarias.getById(id));
                const data = response.data as SecretariasGetByIdResponse;
                setName(data?.data?.name || "");
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as SecretariasGetByIdResponse;
                    toast.error(data?.message || "Erro ao buscar secretaria");
                } else {
                    toast.error("Erro desconhecido ao buscar secretaria");
                }
                navigate("/secretarias");
            }
        };

        fetchSecretaria();
    }, [])

    if (!id) {
        return
    }

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome da Secretaria.");
            return;
        }

        api.put(endpoints.secretarias.update(id), { name })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Secretaria editada com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/secretarias"); // Redireciona para a lista de secretarias
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;

                toast.error(data.message || "Erro ao editar Secretaria. Tente novamente.");

            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Editar Secretaria</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome da Secretaria"
                        placeholder="Digite o nome da Secretaria"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <button className="btn btn-primary mt-3" type="submit">
                        Editar Secretaria
                    </button>
                </div>
            </form>
        </div>
    );
}