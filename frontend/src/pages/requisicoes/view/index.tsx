import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { RelatorioGetByIdResponse, RelatorioItemInput } from "../../../@types/RelatoriosRequests";
import { Context } from "../../../auth-context";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

const ViewRelatorioPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setLoading } = useContext(Context);

    const [relatorio, setRelatorio] = useState<(RelatorioGetByIdResponse["data"] & { itens: RelatorioItemInput[] }) | null>(null);

    useEffect(() => {
        if (!id) {
            toast.error("ID do Relatório não fornecido.");
            navigate("/requisicoes");
            return;
        }
        setLoading(true);
        api.get(endpoints.relatorios.getById(id))
            .then(res => {
                const data = res.data as RelatorioGetByIdResponse;
                if (!data.data) {
                    toast.error(data.message || "Relatório não encontrado");
                    navigate("/requisicoes");
                    return;
                }
                setRelatorio(data.data as any);
            })
            .catch(err => {
                const data = err.response?.data as RelatorioGetByIdResponse;
                toast.error(data?.message || "Erro ao buscar relatório");
                navigate("/requisicoes");
            })
            .finally(() => setLoading(false));
    }, [id]);

    const exportPdf = () => {
        if (!id) return;
        setLoading(true);
        api.get(endpoints.relatorios.exportPdf(id), { responseType: 'blob' })
            .then(response => {
                const blob = new Blob([response.data], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                
                link.href = url;
                link.setAttribute('download', `relatorio-${id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.remove();
            })
            .catch(() => {
                toast.error('Erro ao exportar relatório');
            })
            .finally(() => setLoading(false));
    };

    if (!relatorio) {
        return null;
    }

    return (
        <div className="container-fluid p-3">
            <h1>Requisição Nº {String(relatorio.seq).padStart(7, "0")}</h1>
            <button className="btn btn-success mb-3" onClick={exportPdf}>Exportar PDF</button>
            <div className="bg-body-secondary p-3 rounded">
                <p><strong>Fornecedor:</strong> {relatorio.fornecedor.name}</p>
                <p><strong>Servidor:</strong> {relatorio.user.name}</p>
                <p><strong>Retirante:</strong> {relatorio.nameRetirante || "(Sem retirante)"}</p>
                <p><strong>ID no banco:</strong> {relatorio.id} </p>
                <p><strong>Observações:</strong> {relatorio.observacao || "(Sem observações)"}</p>
                <p><strong>Criado em:</strong> {new Date(relatorio.createdAt).toLocaleString('pt-br')}</p>
                <p><strong>Atualizado em:</strong> {new Date(relatorio.updatedAt).toLocaleString('pt-br')}</p>
                <table className="table table-bordered table-striped text-center">
                    <thead>
                        <th colSpan={4}>Itens</th>
                    </thead>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Quantidade</th>
                            <th>Valor</th>
                            <th>Valor Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {relatorio.itens.map((item, idx) => (
                            <tr key={idx}>
                                <td>{item.produto.name}</td>
                                <td>{item.quantity}</td>
                                <td>R$ {item.valor.toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                <td>R$ {(item.quantity * item.valor).toLocaleString('pt-br', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                            <td>
                                R$ {relatorio.itens.reduce((total, item) => total + (item.quantity * item.valor), 0).toLocaleString('pt-br', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewRelatorioPage;
