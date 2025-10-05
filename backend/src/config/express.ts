import '../bootstrap'
import { env } from '../env'

export default {
  port: env.PORT || 4444,
  urlBackend: env.URL_BACKEND || 'http://localhost:4444',
}
