import { CFormInput } from "@coreui/react";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api";
import endpoints from "../../../utils/endpoints";
import { useNavigate } from "react-router-dom";
import ResponseApiDefault from "../../../@types/ResponseApiDefault";
import formatCpf from "../../../utils/format-cpf";

export const CreateUsuariosPage = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [user, setUsername] = useState("");
    const [cpf, setCpf] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = () => {

        const inputs = [
            {name: "Nome", value: name, isValid: name.length >= 6 && name.length <= 20},
            {name: "Sobrenome", value: surname, isValid: surname.length >= 6 && surname.length <= 20},
            {name: "Nome de Usuário", value: user, isValid: user.length >= 6 && user.length <= 16},
            {name: "Email", value: email, isValid: /\S+@\S+\.\S+/.test(email)},
            {name: "Senha", value: password, isValid: password.length >= 8},
            {name: "Confirmar Senha", value: confirmPassword, isValid: confirmPassword === password},
            {name: "CPF", value: cpf, isValid: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) || /^\d{11}$/.test(cpf) }
        ]

        for(const input of inputs) {
            if (!input.isValid) {
                toast.error(`O campo ${input.name} é inválido. Verifique os requisitos.`);
                return;
            }
        }

        api.post(endpoints.usuarios.create, { name, surname, user, email, password, cpf: cpf.replace(/\D/g, "") })
            .then((response) => {

                const data = response.data as ResponseApiDefault;

                toast.success(data.message || "Usuário criado com sucesso!");
                setName(""); // Limpa o campo após o envio
                navigate("/usuarios"); // Redireciona para a lista de Usuários
            })
            .catch((error) => {

                const data = error.response?.data as ResponseApiDefault;
                
                toast.error(data.message || "Erro ao criar Usuário. Tente novamente.");
            });
    }

    return (
        <div className="container-fluid p-3">
            <h1>Criar Usuário</h1>
            
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
                        type="string"
                        id="cpf"
                        label="CPF"
                        placeholder="Digite o CPF do usuário"
                        value={cpf}
                        onChange={(e) => setCpf(formatCpf(e.target.value))}
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
                        type="password"
                        id="password"
                        label="Senha"
                        placeholder="Digite a senha do Usuário"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
                        required
                    />
                    {password !== confirmPassword && (
                        <div className="text-danger mb-2">
                            As senhas não coincidem. Por favor, verifique.
                        </div>
                    )}

                    <button className="btn btn-primary mt-3" type="submit">
                        Criar Usuário
                    </button>
                </div>
            </form>
        </div>
    );
}