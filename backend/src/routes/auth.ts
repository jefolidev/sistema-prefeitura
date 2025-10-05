import { Router } from 'express'
import { body } from 'express-validator'
import {
  login,
  logout,
  register,
  registerServidor,
} from '../controllers/user.controller'

const authRoutes = Router()

// Register (público)
authRoutes.post(
  '/register',
  [
    body('name').isString().withMessage('name'),
    body('surname').isString().withMessage('surname'),
    body('user')
      .isLength({
        min: 6,
        max: 25,
      })
      .withMessage('user'),
    body('email').isEmail().withMessage('email'),
    body('password')
      .isLength({
        min: 6,
        max: 20,
      })
      .withMessage('password'),
    body('cpf')
      .isLength({
        min: 11,
        max: 11,
      })
      .withMessage('cpf'),
  ],
  register
)

// Register servidor (público, se necessário)
authRoutes.post(
  '/register-servidor',
  [
    body('name').isString().withMessage('name'),
    body('surname').isString().withMessage('surname'),
    body('cpf')
      .isLength({
        min: 11,
        max: 11,
      })
      .withMessage('cpf'),
  ],
  registerServidor
)

// Login (público - CRUCIAL!)
authRoutes.post(
  '/login',
  [
    body('user').isString().withMessage('user'),
    body('senha').isString().withMessage('senha'),
  ],
  login
)

// Logout (pode ser público ou usar token - ajuste conforme sua lógica)
authRoutes.post('/logout', logout)

export default authRoutes
