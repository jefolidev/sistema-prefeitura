import { cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CFormInput,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import { FormEvent, useContext, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import { jwtDecode } from 'jwt-decode'
import { toast } from 'react-toastify'
import {
  JwtPayload,
  UserLoginResponseError,
  UserLoginResponseSuccess,
} from '../../@types/UserLogin.ts'
import { Context } from '../../auth-context.ts'
import api from '../../utils/api.ts'
import endpoints from '../../utils/endpoints.ts'

const Login = () => {
  const navigate = useNavigate()

  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')

  const [inputTypePassword, setInputTypePassword] = useState('password')

  const { setAuthenticated, setLoading } = useContext(Context)

  const submitForm = (e?: FormEvent) => {
    if (e) e.preventDefault()

    if (user === '' || password === '') {
      toast.info('Preencha todos os campos')
      return
    }

    setLoading(true)

    api
      .post(endpoints.auth.login, {
        user,
        senha: password,
      })
      .then((response) => {
        const data = response.data as unknown as UserLoginResponseSuccess

        if (data.status === 200) {
          const token = data.data

          const decoded = jwtDecode<JwtPayload>(token)

          localStorage.setItem('autenticado', '1')
          localStorage.setItem('token', token)
          localStorage.setItem('userId', decoded.id)
          localStorage.setItem('isSuperAdmin', String(decoded.isSuperAdmin))
          toast.success('Login efetuado com sucesso')

          setAuthenticated(true)
          navigate('/')
          location.reload()
        } else {
          toast.error(data.message)
        }

        setLoading(false)
      })
      .catch((error) => {
        if (error && typeof error === 'object') {
          if ('response' in error && error.response) {
            const data = error.response.data as UserLoginResponseError
            toast.error(data.message || 'Erro ao efetuar login')
          } else if ('request' in error && error.request) {
            toast.error('Servidor não respondeu. Tente novamente mais tarde.')
          } else {
            toast.error(
              'Erro na requisição: ' + (error.message || 'Erro desconhecido')
            )
          }
        } else {
          toast.error('Erro inesperado')
        }
        console.log('Erro no login:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

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
                      <p className="text-body-secondary">
                        Faça login na sua conta
                      </p>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Nome de Usuário"
                          aria-label="Nome de Usuário"
                          id={Math.random().toString()}
                          value={user}
                          onChange={(e) =>
                            setUser(
                              e.target.value
                                .slice(0, 25)
                                .replace(/[^a-zA-Z0-9]/g, '')
                            )
                          }
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
                          onClick={() =>
                            setInputTypePassword(
                              inputTypePassword === 'password'
                                ? 'text'
                                : 'password'
                            )
                          }
                        >
                          {inputTypePassword === 'password' ? (
                            <FaEye />
                          ) : (
                            <FaEyeSlash />
                          )}
                        </CButton>
                      </CInputGroup>
                      <div className="row">
                        <div className="col">
                          <button
                            className="btn btn-primary px-4"
                            type="submit"
                          >
                            Fazer Login
                          </button>
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
}

export default Login
