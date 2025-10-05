import '../bootstrap'
import { env } from '../env'
import { logger } from '../shared/utils/logger'

export default {
  url:
    env.URL_REDIS ||
    (() => {
      logger.error('URL_REDIS não foi definida')
      process.exit()
    })(),
}
