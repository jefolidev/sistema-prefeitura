import { cilLockLocked, cilUser } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CButton, CFormInput, CInputGroup, CInputGroupText } from "@coreui/react";
import { FormEvent, useContext, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";
import { UserLoginResponseError, UserLoginResponseSuccess } from "../../@types/UserLogin.ts";
import { Context } from "../../AuthContext.ts";
import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

const Login = () => {
    const navigate = useNavigate();

    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');


    const [inputTypePassword, setInputTypePassword] = useState('password');

    const {setAuthenticated, setLoading} = useContext(Context);

    const submitForm = (e?: FormEvent) => {
        if(e)e.preventDefault();

        if(user === '' || password === '') {
            toast.info('Preencha todos os campos');
            return;
        }

        setLoading(true);

        api.post(endpoints.user.login, {
            user,
            senha: password
        }).then((response) => {
            const data = response.data as unknown as UserLoginResponseSuccess;

            if(data.status === 200) {
                localStorage.setItem("autenticado", "1");
                localStorage.setItem("token", data.data);
                toast.success('Login efetuado com sucesso');
    
                setAuthenticated(true);
                navigate("/");
                location.reload();
            }else{
                toast.error(data.message);
            }

            setLoading(false);
        }).catch((error) => {
            if (error.response) {
                // O servidor respondeu com status diferente de 2xx
                const data = error.response.data as unknown as UserLoginResponseError;
                toast.error(data.message || 'Erro ao efetuar login');
            } else if (error.request) {
                // A requisição foi feita, mas não teve resposta
                toast.error('Servidor não respondeu. Tente novamente mais tarde.');
            } else {
                // Erro na configuração da requisição ou outro erro
                toast.error('Erro na requisição: ' + error.message);
            }
            console.log(JSON.stringify(error, null, 2));
        }).finally(() => {
            setLoading(false);

        });
    };

    return (
        <>
            <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6">
                            <div className="card-group">
                                <div className="card p-4">
                                    <div className="card-body">
                                        <form onSubmit={submitForm}>
                                            <h1>Login</h1>
                                            <p className="text-body-secondary">Faça login na sua conta</p>
                                            <CInputGroup className="mb-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Nome de Usuário"
                                                    aria-label="Nome de Usuário" 
                                                    id={Math.random().toString()}
                                                    value={user}
                                                    onChange={(e) => setUser(e.target.value.slice(0,25).replace(/[^a-zA-Z0-9]/g, ''))}
                                                />
                                            </CInputGroup>
                                            <CInputGroup className="mb-4">
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Senha" 
                                                    aria-label="Senha" 
                                                    id={Math.random().toString()}
                                                    type={inputTypePassword}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                />
                                                <CButton 
                                                    type="button"
                                                    color="secondary"
                                                    variant="outline"
                                                    onClick={() => setInputTypePassword(inputTypePassword === 'password' ? 'text' : 'password')}
                                                >
                                                    {inputTypePassword === 'password' ? <FaEye /> : <FaEyeSlash />}
                                                </CButton>
                                            </CInputGroup>
                                            <div className="row">
                                                <div className="col">
                                                    <button className="btn btn-primary px-4" type="submit">Fazer Login</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
};

export default Login;