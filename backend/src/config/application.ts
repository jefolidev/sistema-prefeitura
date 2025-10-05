import '../bootstrap'
import { env } from '../env'

export default {
  type: env.NODE_ENV || 'development',
}
