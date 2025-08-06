import { CFormInput } from "@coreui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { ServidoresGetByIdResponse } from "../../../@types/ServidoresRequests";
import { Context } from "../../../auth-context";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import formatCpf from "../../../utils/format-cpf";

export const EditServidorPage = () => {

    const { setLoading } = useContext(Context);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [cpf, setCpf] = useState("");

    const [servidorActive, setServidorActive] = useState(false);

    useEffect(() => {

        if(!id) {
            toast.error("ID do Servidor não fornecido.");
            navigate("/servidores");
            return;
        }
        const fetchServidor = async () => {
            try {
                const response = await api.get(endpoints.servidores.getById(id));
                const data = response.data as ServidoresGetByIdResponse;
                if (data.data) {
                    setName(data.data.name || "");
                    setSurname(data.data.surname || "");
                    setCpf(data.data.cpf || "");

                    setServidorActive(data.data.isActive || false);
                } else {
                    toast.error("Servidor não encontrado.");
                    navigate("/servidores");
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as ResponseApiDefault;
                    toast.error(data?.message || "Erro ao buscar servidor");
                } else {
                    toast.error("Erro desconhecido ao buscar servidor");
                }
                navigate("/servidores");
            }
        };

        fetchServidor();
    }, [])

    if (!id) {
        return null;
    }

    const handleSubmit = () => {

        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 6 && name.length <= 20},
            {name: "Sobrenome", value: surname, isValid: surname.length >= 6 && surname.length <= 20},
            {name: "CPF", value: cpf, isValid: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf)}
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.put(endpoints.servidores.update(id), { name, surname, cpf })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Servidor atualizado com sucesso!");
                setName("");
                navigate("/servidores");
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;

                toast.error(data.message || "Erro ao editar Servidor. Tente novamente.");
            });
    }

    const handleActive = () => {
        if (!id) {
            toast.error("ID do Servidor não fornecido.");
            return;
        }
        setLoading(true);
        api.put(endpoints.servidores.activate(id), { isActive: !servidorActive }).then((response) => {
            const data = response.data as ResponseApiDefault;
            setServidorActive(!servidorActive);
            toast.success(data.message || "Servidor atualizado com sucesso!");
            navigate("/servidores");
        }).catch((error) => {
            const data = error.response?.data as ResponseApiDefault;
            toast.error(data.message || "Erro ao atualizar Servidor. Tente novamente.");
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Editar Servidor</h1>

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

                    <div>
                        <button className="btn btn-primary mt-3" type="submit">
                            Atualizar Servidor
                        </button>
                        <button className={[
                            "btn mt-3 ms-2",
                            servidorActive ? "btn-danger" : "btn-success"
                        ].join(" ")} type="button" onClick={handleActive}>
                            {servidorActive ? "Desativar Servidor" : "Ativar Servidor"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
