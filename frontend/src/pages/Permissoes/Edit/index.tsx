import { CFormInput } from "@coreui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PermissionsGetByIdResponse } from "../../../@types/PermissoesRequests";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Context } from "../../../AuthContext";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export const EditPermissaoPage = () => {

    const { setLoading } = useContext(Context);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    
    useEffect(() => {

        if(!id) {
            toast.error("ID do Permissão não fornecido.");
            navigate("/usuarios");
            return;
        }
        // Função para buscar os dados do departamento
        const fetchUser = async () => {
            try {
                const response = await api.get(endpoints.permissoes.getById(id));
                const { data } = response.data as PermissionsGetByIdResponse;
                if (data) {
                    setName(data.name || "");
                    setDescription(data.description || "");

                } else {
                    toast.error("Permissão não encontrado.");
                    navigate("/usuarios");
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as ResponseApiDefault;
                    toast.error(data?.message || "Erro ao buscar usuário");
                } else {
                    toast.error("Erro desconhecido ao buscar usuário");
                }
                navigate("/usuarios");
            }
        };

        fetchUser();
    }, [])

    if (!id) {
        return
    }

    const handleSubmit = () => {

        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 5 && name.length <= 30},
            {name: "Descrição", value: description, isValid: description.length >= 5},
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.put(endpoints.permissoes.update(id), { name, descriptiongit })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Permissão atualizado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/permissoes"); // Redireciona para a lista de Usuários
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao editar Permissão. Tente novamente.");
            });
    }



    return (
        <div className="container-fluid p-3">
            <h1>Editar Permissão</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome do Permissão"
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
                        placeholder="Digite a descrição da Permissão"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <div>
                        <button className="btn btn-primary mt-3" type="submit">
                            Atualizar Permissão
                        </button>
                        {/* <button className={[
                            "btn mt-3 ms-2",
                            userActive ? "btn-danger" : "btn-success"
                        ].join(" ")} type="button" onClick={handleActive}>
                            {userActive ? "Desativar Permissão" : "Ativar Permissão"}
                        </button> */}
                    </div>
                </div>
            </form>
        </div>
    );
}