import { CFormInput } from "@coreui/react";
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import { UsersGetByIdResponse } from "../../../@types/UsersRequests";
import { Context } from "../../../auth-context";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import formatCpf from "../../../utils/format-cpf";
import { UserPermissionsManager } from "../components/user-permissions-manager";

export const EditUsuarioPage = () => {

    const { setLoading } = useContext(Context);

    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [user, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [cpf, setCpf] = useState("");
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [userActive, setUserActive] = useState(false);

    useEffect(() => {

        if(!id) {
            toast.error("ID do Usuário não fornecido.");
            navigate("/usuarios");
            return;
        }
        // Função para buscar os dados do departamento
        const fetchUser = async () => {
            try {
                const response = await api.get(endpoints.usuarios.getById(id));
                const data = response.data as UsersGetByIdResponse;
                if (data.data) {
                    setName(data.data.name || "");
                    setSurname(data.data.surname || "");
                    setUsername(data.data.username || "");
                    setEmail(data.data.email || "");
                    setCpf(data.data.cpf || "");

                    setUserActive(data.data.isActive || false);
                } else {
                    toast.error("Usuário não encontrado.");
                    navigate("/usuarios");
                }
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) {
                    const data = error.response?.data as ResponseApiDefault;
                    toast.error(data?.message || "Erro ao buscar usuário");
                } else {
                    toast.error("Erro desconhecido ao buscar usuário");
                }
                navigate("/usuarios");
            }
        };

        fetchUser();
    }, [])

    if (!id) {
        return
    }

    const handleSubmit = () => {

        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 6 && name.length <= 20},
            {name: "Sobrenome", value: surname, isValid: surname.length >= 6 && surname.length <= 20},
            {name: "Nome de Usuário", value: user, isValid: user.length >= 6 && user.length <= 16},
            {name: "Email", value: email, isValid: /\S+@\S+\.\S+/.test(email)},
            {name: "CPF", value: cpf, isValid: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf)}
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        if(password){
            const inputsPassword = [
                {name: "Senha", value: password, isValid: password.length >= 8},
                {name: "Confirmar Senha", value: confirmPassword, isValid: confirmPassword === password}
            ];

            for(const input of inputsPassword) {
                if (!input.isValid) {
                    toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                    return;
                }
            }
        }

        api.put(endpoints.usuarios.edit(id), { name, surname, user, email, password, cpf })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Usuário atualizado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/usuarios"); // Redireciona para a lista de Usuários
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao editar Usuário. Tente novamente.");
            });
    }

    const handleActive = () => {
        if (!id) {
            toast.error("ID do Usuário não fornecido.");
            return;
        }
        setLoading(true);
        api.put(endpoints.usuarios.activate(id), { isActive: !userActive }).then((response) => {
            const data = response.data as ResponseApiDefault;
            setUserActive(!userActive);
            toast.success(data.message || "Usuário atualizado com sucesso!");
            navigate("/usuarios");
        }).catch((error) => {
            const data = error.response?.data as ResponseApiDefault;
            toast.error(data.message || "Erro ao atualizar Usuário. Tente novamente.");
        }).finally(() => {
            setLoading(false);
        });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Editar Usuário</h1>
            
            <form onSubmit={e => {
                e.preventDefault();
                handleSubmit();
            }}>
                <div className="bg-body-secondary p-3 rounded">
                    <CFormInput
                        type="string"
                        id="name"
                        label="Nome"
                        placeholder="Digite o nome do Usuário"
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
                        placeholder="Digite o sobrenome do Usuário"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                    />

                    <CFormInput
                        type="string"
                        id="username"
                        label="Nome de Usuário"
                        placeholder="Digite o nome de usuário"
                        value={user}
                        minLength={6}
                        maxLength={16}
                        onChange={(e) => setUsername(e.target.value.slice(0, 16))}
                        required
                    />

                    <CFormInput
                        type="email"
                        id="email"
                        label="Email"
                        placeholder="Digite o email do Usuário"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    
                    <CFormInput
                        type="string"
                        id="cpf"
                        label="CPF"
                        placeholder="Digite o CPF do usuário"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
                        required
                    />


                    <div className="mt-4">
                        <small className="form-text text-muted">
                            ATENÇÃO: Deixe em branco se não quiser alterar a senha.
                        </small>
                    </div>
                    <CFormInput
                        type="password"
                        id="password"
                        label="Senha Nova"
                        placeholder="Digite a senha do Usuário"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        
                    />
                    {password && password.length < 8 && (
                        <div className="text-danger mb-2">
                            A senha deve ter pelo menos 8 caracteres.
                        </div>
                    )}


                    <CFormInput
                        type="password"
                        id="confirmPassword"
                        label="Confirmar Senha"
                        placeholder="Confirme a senha do Usuário"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        
                    />
                    {password !== confirmPassword && (
                        <div className="text-danger mb-2">
                            As senhas não coincidem. Por favor, verifique.
                        </div>
                    )}

                    <UserPermissionsManager/>

                    <div>
                        <button className="btn btn-primary mt-3" type="submit">
                            Atualizar Usuário
                        </button>
                        <button className={[
                            "btn mt-3 ms-2",
                            userActive ? "btn-danger" : "btn-success"
                        ].join(" ")} type="button" onClick={handleActive}>
                            {userActive ? "Desativar Usuário" : "Ativar Usuário"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}