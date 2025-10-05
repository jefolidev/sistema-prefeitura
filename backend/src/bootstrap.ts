import dotenv from 'dotenv'
import { env } from './env'

dotenv.config({
  path: env.NODE_ENV === 'test' ? '.env.test' : '.env',
})
