import { CFormInput } from "@coreui/react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Context } from "../../../auth-context";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import formatCpf from "../../../utils/format-cpf";

export const CreateDepartamentoPage = () => {
    const navigate = useNavigate();
    const { setLoading } = useContext(Context);

    const [name, setName] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [cpf, setCpf] = useState("");

    // Sem carregamento de usuários; campos de responsável e CPF são preenchidos manualmente

    const handleSubmit = async () => {

        setLoading(true);

        if(name == ""){
            toast.error("Por favor, preencha o nome do departamento.");
            return;
        }

        await api.post(endpoints.departamentos.create, { name, responsavel, cpf: cpf ? cpf.replace(/\D/g, "") : undefined })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Departamento criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/departamentos"); // Redireciona para a lista de departamentos
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao criar departamento. Tente novamente.");
            });
        
        setLoading(false);
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Departamento</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome do Departamento"
                        placeholder="Digite o nome do departamento"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mb-3"
                    />
                    <CFormInput
                        type="text"
                        id="responsavel"
                        label="Responsável"
                        placeholder="Digite o nome do responsável"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                        required
                        className="mb-3"
                    />
                    <CFormInput
                        type="text"
                        id="cpf"
                        label="CPF"
                        placeholder="Digite o CPF do responsável"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                    />

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar Departamento
                    </button>
                </div>
            </form>
            {/* Aqui você pode adicionar o formulário ou componentes necessários para criar um departamento */}
        </div>
    );
}