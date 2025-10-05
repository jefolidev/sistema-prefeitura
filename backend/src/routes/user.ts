import { Router } from 'express'
import { body } from 'express-validator'
import {
  getAllServidores,
  getAllUsers,
  getUserById,
  myAccount,
  registerServidor,
  toggleSuperUser,
} from '../controllers/user.controller'

const userRoutes = Router()

userRoutes.get('/', getAllUsers)

userRoutes.get('/servidores', getAllServidores)

userRoutes.get('/id/:id', [body('id').isUUID().withMessage('id')], getUserById)

userRoutes.post(
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

userRoutes.patch('/toggleSuperUser/:id', toggleSuperUser)

userRoutes.post('/myaccount', myAccount)

export default userRoutes
