import { CFormInput } from "@coreui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";

export const CreateSecretariasPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome da secretaria.");
            return;
        }

        api.post(endpoints.secretarias.create, { name })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Secretaria criada com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/secretarias"); // Redireciona para a lista de Secretarias
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao criar Secretaria. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Secretaria</h1>
            
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
                        Criar Secretaria
                    </button>
                </div>
            </form>
        </div>
    );
}