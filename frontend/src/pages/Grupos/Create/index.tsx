import { CFormInput } from "@coreui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";

export const CreateGruposPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome do grupo.");
            return;
        }

        api.post(endpoints.grupos.create, { name })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Grupo criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/grupos"); // Redireciona para a lista de Grupos
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao criar Grupo. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Grupo</h1>
            
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
                        Criar Grupo
                    </button>
                </div>
            </form>
        </div>
    );
}