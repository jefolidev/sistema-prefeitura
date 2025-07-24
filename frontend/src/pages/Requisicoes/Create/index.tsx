import { CFormInput, CFormSelect } from "@coreui/react";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Fornecedores, FornecedoresGetResponse } from "../../../@types/FornecedoresRequests";
import { Users, UsersGetResponse } from "../../../@types/UsersRequests";
import { Produtos, ProdutosGetResponse } from "../../../@types/ProdutosRequests";
import { Departamentos, DepartamentosGetResponse } from "../../../@types/DepartamentosRequests";
import { RelatorioCreateRequestBody, RelatorioItemInput } from "../../../@types/RelatoriosRequests";
import { Context } from "../../../AuthContext";

export const CreateRelatorioPage = () => {
    const navigate = useNavigate();
    const { setLoading } = useContext(Context);

    const [fornecedorId, setFornecedorId] = useState("");
    const [userId, setUserId] = useState("");
    const [nameRetirante, setNameRetirante] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [itens, setItens] = useState<RelatorioItemInput[]>([
        { produtoId: "", quantity: 1 }
    ]);

    const [fornecedores, setFornecedores] = useState<Fornecedores[]>([]);
    const [usuarios, setUsuarios] = useState<Users[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
    const [departamentoId, setDepartamentoId] = useState("");
    const [produtos, setProdutos] = useState<Produtos[]>([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(endpoints.fornecedores.getAll),
            api.get(endpoints.servidores.getAll),
            api.get(endpoints.departamentos.getAll),
        ])
            .then(([f, u, d]) => {
                setFornecedores((f.data as FornecedoresGetResponse).data);
                setUsuarios((u.data as UsersGetResponse).data);
                setDepartamentos((d.data as DepartamentosGetResponse).data);
            })
            .catch(() => toast.error("Erro ao carregar dependências"))
            .finally(() => setLoading(false));
    }, [setLoading]);

    const handleItemChange = (index: number, field: keyof RelatorioItemInput, value: string | number) => {
        setItens(current => current.map((item, i) => i === index ? { ...item, [field]: value } : item));
    };

    const addItem = () => setItens(current => [...current, { produtoId: "", quantity: 1 }]);

    const removeItem = (idx: number) => setItens(current => current.filter((_, i) => i !== idx));

    const handleSubmit = () => {
        if (!fornecedorId || !userId || !departamentoId || itens.some(i => !i.produtoId || i.quantity <= 0)) {
            toast.error("Preencha todos os campos corretamente.");
            return;
        }
        const payload: RelatorioCreateRequestBody = { fornecedorId, userId, departamentoId, itens, nameRetirante, observacoes };
        api.post(endpoints.relatorios.create, payload)
            .then(res => {
                const data = res.data as ResponseApiDefault;
                toast.success(data.message || "Relatório criado com sucesso!");
                navigate("/requisicoes");
            })
            .catch(err => {
                const data = err.response?.data as ResponseApiDefault;
                toast.error(data?.message || "Erro ao criar Relatório");
            });
    };
    
    useEffect(() => {
        if (fornecedorId) {
            setLoading(true);
            api.get(`${endpoints.produtos.getAll}?fornecedorId=${fornecedorId}`)
                .then(res => {
                    setProdutos((res.data as ProdutosGetResponse).data);
                })
                .catch(() => toast.error("Erro ao carregar produtos do fornecedor"))
                .finally(() => setLoading(false));
        } else {
            setProdutos([]);
        }
    }, [fornecedorId, setLoading]);

    return (
        <div className="container-fluid p-3">
            <h1>Criar Requisição</h1>
            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormSelect
                        id="fornecedor"
                        label="Fornecedor"
                        className="mb-2"
                        value={fornecedorId}
                        onChange={e => setFornecedorId(e.target.value)}
                        required
                    >
                        <option value="">Selecione...</option>
                        {fornecedores.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                    </CFormSelect>
                    <CFormSelect
                        id="usuario"
                        label="Servidor"
                        className="mb-2"
                        value={userId}
                        onChange={e => setUserId(e.target.value)}
                        required
                    >
                        <option value="" disabled>Selecione...</option>
                        {usuarios.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </CFormSelect>
                    <CFormSelect
                        id="departamento"
                        label="Departamento"
                        className="mb-2"
                        value={departamentoId}
                        onChange={e => setDepartamentoId(e.target.value)}
                        required
                    >
                        <option value="">Selecione...</option>
                        {departamentos.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </CFormSelect>
                    <CFormInput
                        type="text"
                        id="nomeRetirante"
                        label="Nome do Retirante"
                        className="mb-2"
                        value={nameRetirante}
                        onChange={e => setNameRetirante(e.target.value)}
                        placeholder="Nome do usuário retirante..."
                        required
                    />
                    <CFormInput
                        type="text"
                        id="observacoes"
                        label="Observações"
                        className="mb-2"
                        value={observacoes}
                        onChange={e => setObservacoes(e.target.value)}
                        placeholder="Observações adicionais..."
                    />
                    <div className="text-secondary">É possível gerar relatórios por fornecedor, com até 9 produtos por relatório.</div>
                    <div className="text-secondary">Para incluir mais produtos, utilize o botão "Adicionar Item".</div>
                    <div className="text-secondary">O preço registrado no relatório corresponderá ao preço atual do produto.</div>

                    <hr />
                    <h5>Itens</h5>
                    <table className="table table-bordered table-striped text-center mb-3">
                        <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Quantidade</th>
                                <th>Valor</th>
                                <th>Valor Total</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((item, index) => (
                                <tr key={index}>
                                    <td>
                                        <CFormSelect
                                            value={item.produtoId}
                                            onChange={e => handleItemChange(index, 'produtoId', e.target.value)}
                                            required
                                        >
                                            <option value="">Produto...</option>
                                            {produtos.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </CFormSelect>
                                    </td>
                                    <td>
                                        <CFormInput
                                            type="number"
                                            min={1}
                                            step={(() => {
                                                const produto = produtos.find(p => p.id === item.produtoId);
                                                return produto?.unidadeMedida === "litragem" ? Number('0.01') : Number('1');
                                            })()}
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))}
                                            required
                                        />
                                    </td>
                                    <td>R$ {(produtos.find(p => p.id === item.produtoId)?.valor || 0).toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    <td>R$ {(item.quantity * (produtos.find(p => p.id === item.produtoId)?.valor || 0)).toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    <td>
                                        <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                                <td>
                                    R$ {itens.reduce((total, item) => total + (item.quantity * (produtos.find(p => p.id === item.produtoId)?.valor || 0)), 0).toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>

                    </table>

                    <button type="button" className="btn btn-secondary me-2" onClick={addItem}>
                        Adicionar Item
                    </button>
                    <button className="btn btn-primary" type="submit">
                        Criar Relatório
                    </button>
                </div>
            </form>
        </div>
    );
};

