import { CBadge, CFormInput, CFormSelect } from "@coreui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { Telas } from "../../../@types/Telas";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";

export const CreatePermissoesPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [telasParaRestringir, setTelasParaRestringir] = useState<string[]>([]);

    const telaOptions = Object.entries(Telas).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        value,
    }));

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

        api.post(endpoints.permissoes.create, {
            name,
            description,
            routesToRestrict: telasParaRestringir,
        })
            .then((response) => {
                const data = response.data as ResponseApiDefault;
                toast.success(data.message || "Permissão criada com sucesso!");
                navigate("/permissoes");
            })
            .catch((error) => {
                const data = error.response?.data as ResponseApiDefault;
                console.error(JSON.stringify(data, null, 2));
                toast.error(data.message || "Erro ao criar permissão. Tente novamente.");
            });
    };

    return (
        <div className="container-fluid p-3">
            <h1>Criar Permissão</h1>

            <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="text"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome da permissão"
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
                        placeholder="Digite a descrição da permissão"
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
                                onClick={() =>
                                    setTelasParaRestringir((prev) => prev.filter((t) => t !== tela))
                                }
                            >
                                {tela} &times;
                            </CBadge>
                        ))}
                    </div>

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar permissão
                    </button>
                </div>
            </form>
        </div>
    );
};
