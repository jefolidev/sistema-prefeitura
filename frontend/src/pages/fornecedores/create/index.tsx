import { CFormInput, CFormTextarea } from "@coreui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { formatCnpj } from "../../../utils/format-cnpj";
import formatPhone from "../../../utils/format-phone";

export const CreateFornecedoresPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [endereco, setEndereco] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [observacoes, setObservacoes] = useState("");

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome do fornecedor.");
            return;
        }

        api.post(endpoints.fornecedores.create, {
            name,
            cnpj: cnpj || undefined,
            razaoSocial: razaoSocial || undefined,
            endereco: endereco || undefined,
            email: email || undefined,
            telefone: telefone || undefined,
            observacoes: observacoes || undefined,
        })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Fornecedor criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/fornecedores"); // Redireciona para a lista de Fornecedor
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao criar Fornecedor. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Fornecedor</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <div className="mb-3">
                        <CFormInput
                            type="string"
                            id="name"
                            label="Nome do Fornecedor"
                            placeholder="Digite o nome do Fornecedor"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <CFormInput
                            type="text"
                            id="cnpj"
                            label="CNPJ"
                            placeholder="CNPJ do Fornecedor"
                            value={cnpj}
                            onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                            className=""
                        />
                    </div>
                    <div className="mb-3">
                        <CFormInput
                            type="text"
                            id="razaoSocial"
                            label="Razão Social"
                            placeholder="Razão Social do Fornecedor"
                            value={razaoSocial}
                            onChange={(e) => setRazaoSocial(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <CFormInput
                            type="text"
                            id="endereco"
                            label="Endereço"
                            placeholder="Endereço"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <CFormInput
                            type="email"
                            id="email"
                            label="E-mail"
                            placeholder="E-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <CFormInput
                            type="text"
                            id="telefone"
                            label="Telefone"
                            placeholder="Telefone"
                            value={telefone}
                            onChange={(e) => setTelefone(formatPhone(e.target.value))}
                        />
                    </div>
                    <div className="mb-3">
                        <CFormTextarea
                            id="observacoes"
                            label="Observações"
                            placeholder="Observações"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar Fornecedor
                    </button>
                </div>
            </form>
        </div>
    );
}
