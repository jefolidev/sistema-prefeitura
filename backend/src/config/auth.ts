import '../bootstrap'
import { env } from '../env'

export default {
  secret: env.JWT_SECRET || 'mysecret',
  expiresIn: '360m',
  refreshSecret: env.JWT_REFRESH_SECRET || 'myanothersecret',
  refreshExpiresIn: '7d',
  saltHash: 10,
}
