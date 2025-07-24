import { cilAt, cilLockLocked, cilScreenSmartphone, cilUser, cilUserPlus } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import { CButton, CFormInput, CInputGroup, CInputGroupText } from "@coreui/react";
import { FormEvent, useContext, useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import api from "../../utils/api";
import endpoints from "../../utils/endpoints";

import { Context } from "../../AuthContext";

const Cadastrar = () => {

    const navigate = useNavigate();

    const [nomeCompleto, setNomeCompleto] = useState('');
    const [nomeUsuario, setNomeUsuario] = useState('');
    const [telefone, setTelefone] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const [typeInputPassword, setTypeInputPassword] = useState('password');
    const [isSenhaSegura, setIsSenhaSegura] = useState(false);

    const { setLoading } = useContext(Context);

    useEffect(() => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(senha);
        const hasLowerCase = /[a-z]/.test(senha);
        const hasNumber = /[0-9]/.test(senha);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(senha);

        if (senha.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar) {
            setIsSenhaSegura(true);
        } else {
            setIsSenhaSegura(false);
        }
    }, [senha])

    const submitForm = (e:FormEvent) => {
        e.preventDefault();

        const condicoes = [
            {condicao: nomeCompleto.length === 0, mensagem: 'O campo Nome é obrigatório'},
            {condicao: nomeUsuario.length === 0, mensagem: 'O campo Nome de Usuário é obrigatório'},
            {condicao: !(nomeUsuario.length >= 6 && nomeUsuario.length <= 25), mensagem: 'Nome de Usuário Inválido'},
            {condicao: telefone.length === 0, mensagem: 'O campo Telefone é obrigatório'},
            {condicao: telefone.length < 10 || telefone.length > 11, mensagem: 'Telefone Inválido'},
            {condicao: email.length === 0, mensagem: 'O campo E-mail é obrigatório'},
            {condicao: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), mensagem: 'E-mail Inválido'},
            {condicao: senha.length === 0, mensagem: 'O campo Senha é obrigatório'},
            {condicao: !isSenhaSegura, mensagem: 'A senha está fraca'},
            {condicao: senha !== confirmarSenha, mensagem: 'As senhas não são iguais'},
        ]

        for(const condicao of condicoes) {
            if (condicao.condicao) {
                toast.error(condicao.mensagem);
                return;
            }
        }

        setLoading(true);

        api.post(endpoints.user.register, {
            nome: nomeCompleto,
            user: nomeUsuario,
            numero: telefone,
            email: email,
            senha: senha
        }).then((result) => {
            toast.success('Cadastro realizado com sucesso');

            if(result.data.isCodigo){
                toast.info('Um código foi enviado para o seu e-mail para confirmação. Utilize-o ao fazer login.', {
                    autoClose: 10000
                });
            }

            navigate('/login', {
                state: {
                    user: nomeUsuario,
                    password: senha
                }
            });
        }).catch(() => {
            toast.error('Erro ao realizar cadastro');
        }).finally(() => {
            setLoading(false);
        });

    };

    return (
        <>
            <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-5">
                            <div className="card-group">
                                <div className="card p-4">
                                    <div className="card-body">
                                        <form onSubmit={submitForm}>
                                            <h1>Cadastro</h1>
                                            <p className="text-body-secondary">Faça agora o seu cadastro conosco</p>
                                            <CInputGroup className="mb-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilUserPlus} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Nome Completo"
                                                    aria-label="Nome Completo" 
                                                    id={Math.random().toString()}
                                                    maxLength={45}
                                                    required
                                                    value={nomeCompleto}
                                                    onChange={(e) => setNomeCompleto(e.target.value.slice(0,45))}
                                                />
                                            </CInputGroup>
                                            <CInputGroup className="mb-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilUser} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Nome de Usuário"
                                                    aria-label="Nome de Usuário" 
                                                    id={Math.random().toString()}
                                                    maxLength={25}
                                                    minLength={8}
                                                    required
                                                    value={nomeUsuario}
                                                    onChange={(e) => setNomeUsuario(e.target.value.slice(0,25).replace(/[^a-zA-Z0-9]/g, ''))}
                                                />
                                            </CInputGroup>
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilScreenSmartphone} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Número de Telefone"
                                                    aria-label="Número de Telefone" 
                                                    id={Math.random().toString()}
                                                    value={telefone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}
                                                    onChange={(e) => setTelefone(e.target.value.replace(/[^0-9]/g, '').slice(0,11))}
                                                    pattern="\(\d{2}\) \d{4,5}-\d{4}"

                                                />
                                            </CInputGroup>
                                            <p className="mb-3 text-secondary">(XX) XXXX-XXXX ou (XX) XXXXX-XXXX</p>
                                            <CInputGroup className="mb-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilAt} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="E-mail"
                                                    aria-label="E-mail" 
                                                    id={Math.random().toString()}
                                                    type="email"
                                                    maxLength={150}
                                                    required
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value.slice(0,150))}
                                                />
                                            </CInputGroup>
                                            <CInputGroup>
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Senha" 
                                                    aria-label="Senha" 
                                                    id={Math.random().toString()}
                                                    type={typeInputPassword}
                                                    minLength={8}
                                                    required
                                                    value={senha}
                                                    onChange={(e) => setSenha(e.target.value)}
                                                />
                                                <CButton 
                                                    type="button"
                                                    color="secondary"
                                                    variant="outline"
                                                    onClick={() => setTypeInputPassword(typeInputPassword === 'password' ? 'text' : 'password')}
                                                >
                                                    {typeInputPassword === 'password' ? <FaEye /> : <FaEyeSlash />}
                                                </CButton>
                                            </CInputGroup>
                                            {!isSenhaSegura && senha.length > 0 && (
                                                <p className={`text-${isSenhaSegura ? 'success' : 'danger'}`}>A senha está fraca</p>
                                            )}
                                            <CInputGroup className="mt-3">
                                                <CInputGroupText>
                                                    <CIcon icon={cilLockLocked} />
                                                </CInputGroupText>
                                                <CFormInput 
                                                    placeholder="Confirme a Senha" 
                                                    aria-label="Confirme a Senha" 
                                                    id={Math.random().toString()}
                                                    type={typeInputPassword}
                                                    minLength={8}
                                                    required
                                                    value={confirmarSenha}
                                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                                />
                                                <CButton 
                                                    type="button"
                                                    color="secondary"
                                                    variant="outline"
                                                    onClick={() => setTypeInputPassword(typeInputPassword === 'password' ? 'text' : 'password')}
                                                >
                                                    {typeInputPassword === 'password' ? <FaEye /> : <FaEyeSlash />}
                                                </CButton>
                                            </CInputGroup>
                                            {senha !== confirmarSenha && confirmarSenha.length > 0 && (
                                                <p className="text-danger">As senhas não são iguais</p>
                                            )}
                                            <div className="row mt-4">
                                                <div className="col">
                                                    <button className="btn btn-primary px-4" type="submit">Fazer Cadastro</button>
                                                </div>
                                            </div>

                                            <div className="row mt-3">
                                                <div className="col">
                                                    <p className="text-primary m-0">Já tem cadastro com a gente? Faça login <a href="/login">aqui</a></p>
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

export default Cadastrar;