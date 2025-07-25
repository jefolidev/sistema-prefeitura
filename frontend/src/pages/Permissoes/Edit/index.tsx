import { CBadge, CFormInput, CFormSelect } from "@coreui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { PermissionsGetByIdResponse, PermissionsGetResponse } from "../../../@types/PermissoesRequests";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Telas } from "../../../@types/Telas";
import { Context } from "../../../AuthContext";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export const EditPermissaoPage = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [telasParaRestringir, setTelasParaRestringir] = useState<string[]>([]);

    const { setLoading } = useContext(Context);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const telaOptions = Object.entries(Telas).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        value,
    }));

    useEffect(() => {
        if (!id) {
            toast.error("ID da Permissão não fornecido.");
            navigate("/usuarios");
            return;
        }

        const fetchPermissao = async () => {
            try {
                const response = await api.get(endpoints.permissoes.getById(id));
                const { data } = response.data as PermissionsGetByIdResponse;

                if (data) {
                    setName(data.name || "");
                    setDescription(data.description || "");
                    setTelasParaRestringir(data.routesToRestrict || []);
                } else {
                    toast.error("Permissão não encontrada.");
                    navigate("/usuarios");
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as ResponseApiDefault;
                    toast.error(data?.message || "Erro ao buscar permissão");
                } else {
                    toast.error("Erro desconhecido ao buscar permissão");
                }
                navigate("/usuarios");
            }
        };

        fetchPermissao();
    }, [id]);

    if (!id) return null;

    const handleSubmit = () => {
        const inputs = [
            { name: "Nome", value: name, isValid: name.length >= 5 && name.length <= 30 },
            { name: "Descrição", value: description, isValid: description.length >= 5 },
        ];

        for (const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.put(endpoints.permissoes.update(id!), {
            name,
            description,
            routesToRestrict: telasParaRestringir,
        })
            .then((response) => {
                const data = response.data as ResponseApiDefault;
                toast.success(data.message || "Permissão atualizada com sucesso!");
                navigate("/permissoes");
            })
            .catch((error) => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data.message || "Erro ao editar Permissão. Tente novamente.");
            });
    };

    const handleRemove = () => {
        api.delete(endpoints.permissoes.delete(id))
            .then((response) => {
                const data = response.data as PermissionsGetResponse;
                toast.success(data.message);
            })
            .catch((error) => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao excluir departamento");
            })
            .finally(() => {
                setLoading(false);
                navigate("/permissoes");
            });
    };

    return (
        <div className="container-fluid p-3">
            <h1>Editar Permissão</h1>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="text"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome da Permissão"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        minLength={5}
                        maxLength={30}
                        required
                    />

                    <CFormInput
                        type="text"
                        id="description"
                        label="Descrição"
                        placeholder="Digite a descrição da Permissão"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        minLength={5}
                        required
                    />

                    <CFormSelect
                        id="routesToRestrict"
                        label="Telas para restringir"
                        value=""
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value && !telasParaRestringir.includes(value)) {
                                setTelasParaRestringir((prev) => [...prev, value]);
                            }
                        }}
                        className="mb-2"
                    >
                        <option value="">Selecione...</option>
                        {telaOptions
                            .filter((tela) => !telasParaRestringir.includes(tela.value))
                            .map((tela) => (
                                <option key={tela.value} value={tela.value}>
                                    {tela.label}
                                </option>
                            ))}
                    </CFormSelect>

                    <div className="mb-2 d-flex flex-wrap gap-2">
                        {telasParaRestringir.map((tela) => (
                            <CBadge
                                key={tela}
                                color="primary"
                                className="p-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => setTelasParaRestringir(prev => prev.filter(t => t !== tela))}
                            >
                                {tela} &times;
                            </CBadge>
                        ))}
                    </div>

                    <div>
                        <button className="btn btn-primary mt-3" type="submit">
                            Atualizar Permissão
                        </button>
                        <button className="btn mt-3 ms-2 btn-danger text-white" type="button" onClick={handleRemove}>
                            Remover Permissão
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
