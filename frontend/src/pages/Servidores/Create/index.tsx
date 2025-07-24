import { CFormInput } from "@coreui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import formatCpf from "../../../utils/format-cpf";

export const CreateServidorPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [cpf, setCpf] = useState("");

    const handleSubmit = () => {

        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 6 && name.length <= 20},
            {name: "Sobrenome", value: surname, isValid: surname.length >= 6 && surname.length <= 20},
            {name: "CPF", value: cpf, isValid: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf) }
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.post(endpoints.servidores.create, { name, surname, cpf: cpf.replace(/\D/g, "") })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Servidor criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/servidores"); // Redireciona para a lista de Servidores
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;

                toast.error(data.message || "Erro ao criar Servidor. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Servidor</h1>

            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome do Servidor"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={6}
                        maxLength={20}
                        required
                    />

                    <CFormInput
                        type="string"
                        id="surname"
                        minLength={6}
                        maxLength={20}
                        label="Sobrenome"
                        placeholder="Digite o sobrenome do Servidor"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                    />

                    <CFormInput
                        type="string"
                        id="cpf"
                        label="CPF"
                        placeholder="Digite o CPF do servidor"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        required
                    />

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar Servidor
                    </button>
                </div>
            </form>
        </div>
    );
}
