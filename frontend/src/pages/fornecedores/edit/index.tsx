import { CFormInput, CFormTextarea } from "@coreui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FornecedoresGetByIdResponse } from "../../../@types/FornecedoresRequests";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { formatCnpj } from "../../../utils/format-cnpj";
import formatPhone from "../../../utils/format-phone";

export const EditFornecedorPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [name, setName] = useState("");
    const [cnpj, setCnpj] = useState("");
    const [razaoSocial, setRazaoSocial] = useState("");
    const [endereco, setEndereco] = useState("");
    const [email, setEmail] = useState("");
    const [telefone, setTelefone] = useState("");
    const [observacoes, setObservacoes] = useState("");

    useEffect(() => {

        if(!id) {
            toast.error("ID do Fornecedor não fornecido.");
            navigate("/fornecedores");
            return;
        }
        // Função para buscar os dados do departamento
        const fetchDepartamento = async () => {
            try {
                const response = await api.get(endpoints.fornecedores.getById(id));
                const data = response.data as FornecedoresGetByIdResponse;
                setName(data?.data?.name || "");
                setCnpj(data?.data?.cnpj || "");
                setRazaoSocial(data?.data?.razaoSocial || "");
                setEndereco(data?.data?.endereco || "");
                setEmail(data?.data?.email || "");
                setTelefone(data?.data?.telefone || "");
                setObservacoes(data?.data?.observacoes || "");
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as FornecedoresGetByIdResponse;
                    toast.error(data?.message || "Erro ao buscar fornecedor");
                } else {
                    toast.error("Erro desconhecido ao buscar fornecedor");
                }
                navigate("/fornecedores");
            }
        };

        fetchDepartamento();
    }, [])

    if (!id) {
        return
    }

    const handleSubmit = () => {

        if(name == ""){
            toast.error("Por favor, preencha o nome do Fornecedor.");
            return;
        }

        api.put(endpoints.fornecedores.update(id), {
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
                navigate("/fornecedores"); // Redireciona para a lista de departamentos
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;

                toast.error(data.message || "Erro ao criar Fornecedor. Tente novamente.");

            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Editar Fornecedor</h1>
            
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
                        Editar Fornecedor
                    </button>
                </div>
            </form>
        </div>
    );
}
