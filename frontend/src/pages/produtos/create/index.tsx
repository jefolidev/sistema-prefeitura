import { CFormInput, CFormSelect, CFormTextarea } from "@coreui/react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Departamentos, DepartamentosGetResponse } from "../../../@types/DepartamentosRequests";
import { Fornecedores, FornecedoresGetResponse } from "../../../@types/FornecedoresRequests";
import { Grupos, GruposGetResponse } from "../../../@types/GruposRequests";
import { ProdutosCreateRequestBody } from "../../../@types/ProdutosRequests";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Context } from "../../../auth-context";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export const CreateProdutosPage = () => {
    const navigate = useNavigate();
    const { setLoading } = useContext(Context);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [fornecedorId, setFornecedorId] = useState("");
    const [departamentoId, setDepartamentoId] = useState("");
    const [unidadeMedida, setUnidadeMedida] = useState("Unidade");
    const [grupoId, setGrupoId] = useState("");
    const [valor, setValor] = useState(0);

    const [fornecedores, setFornecedores] = useState<Fornecedores[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
    const [grupos, setGrupos] = useState<Grupos[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.fornecedores.getAll),
            api.get(endpoints.departamentos.getAll),
            api.get(endpoints.grupos.getAll),
        ])
            .then(([f, d, g]) => {
                const fData = f.data as FornecedoresGetResponse;
                const dData = d.data as DepartamentosGetResponse;
                const gData = g.data as GruposGetResponse;
                setFornecedores(fData.data);
                setDepartamentos(dData.data);
                setGrupos(gData.data);
            })
            .catch(() => {
                toast.error("Erro ao carregar dependências");
            })
            .finally(() => setLoading(false));
    }, [setLoading]);

    const handleSubmit = () => {
        if (name === "") {
            toast.error("Por favor, preencha o nome do produto.");
            return;
        }

        const payload: ProdutosCreateRequestBody = {
            name,
            description: description || undefined,
            unidadeMedida,
            grupoId,
            fornecedorId,
            departamentoId: departamentoId || undefined,
            valor: valor
        };

        api.post(endpoints.produtos.create, payload)
            .then((response) => {
                const data = response.data as ResponseApiDefault;
                toast.success(data.message || "Produto criado com sucesso!");
                navigate("/produtos");
            })
            .catch((error) => {
                const data = error.response?.data as ResponseApiDefault;
                toast.error(data.message || "Erro ao criar Produto. Tente novamente.");
            });
    };

    return (
        <div className="container-fluid p-3">
            <h1>Criar Produto</h1>
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome do Produto"
                        placeholder="Digite o nome do Produto"
                        className="mb-2"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <CFormTextarea
                        id="description"
                        label="Descrição"
                        placeholder="Descrição do Produto"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mb-2"
                    />
                    <CFormInput
                        type="text"
                        id="price"
                        label="Preço"
                        placeholder="Preço"
                        value={Number(valor.toFixed(2)).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                        })}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, '');

                            if (!rawValue) {
                                setValor(Number(e.target.value))
                                return;
                            }

                            const numericValue = Number(rawValue) / 100;
                            
                            setValor(Number(numericValue))
                        }}
                        required
                        className="mb-2"
                    />
                    <CFormSelect
                        id="fornecedor"
                        label="Fornecedor"
                        value={fornecedorId}
                        onChange={(e) => setFornecedorId(e.target.value)}
                        required
                        className="mb-2"
                    >
                        <option value="">Selecione...</option>
                        {fornecedores.map((f) => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </CFormSelect>
                    <CFormSelect
                        id="departamento"
                        label="Departamento"
                        value={departamentoId}
                        onChange={(e) => setDepartamentoId(e.target.value)}
                        className="mb-2"
                    >
                        <option value="">Selecione...</option>
                        {departamentos.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </CFormSelect>
                    <CFormSelect
                        id="unit"
                        label="Unidade de Medida"
                        value={unidadeMedida}
                        onChange={(e) => setUnidadeMedida(e.target.value)}
                        required
                        className="mb-2"
                    >
                        <option value="Unidade">Unidade</option>
                        <option value="peça">Peça</option>
                        <option value="saco">Saco</option>
                        <option value="kit">Kit</option>
                        <option value="litragem">Litragem</option>
                    </CFormSelect>
                    <CFormSelect
                        id="grupo"
                        label="Grupo"
                        value={grupoId}
                        onChange={(e) => setGrupoId(e.target.value)}
                        required
                        className="mb-2"
                    >
                        <option value="">Selecione...</option>
                        {grupos.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </CFormSelect>
                    <button className="btn btn-primary mt-3" type="submit">
                        Criar Produto
                    </button>
                </div>
            </form>
        </div>
    );
}
