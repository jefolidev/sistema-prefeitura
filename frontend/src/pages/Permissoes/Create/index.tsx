import { CFormInput } from "@coreui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export const CreatePermissoesPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 0 && name.length <= 30},
            {name: "Descrição", value: description, isValid: description.length >= 5 },
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.post(endpoints.permissoes.create, { name, description }) 
            .then((response) => {

                const data = response.data as ResponseApiDefault;
                
                toast.success(data.message || "Permissão criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/permissoes"); // Redireciona para a lista de Usuários
            })
            .catch((error) => {
                const data = error.response?.data as ResponseApiDefault;
                console.log(JSON.stringify(data, null, 2))
                
                toast.error(data.message || "Erro ao criar permissão. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Permissão</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome da permissão"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={5}
                        maxLength={30}
                        required
                    />

                    <CFormInput
                        type="string"
                        id="description"
                        minLength={5}
                        label="Descrição"
                        placeholder="Digite a descrição da permissão"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar permissão
                    </button>
                </div>
            </form>
        </div>
    );
}