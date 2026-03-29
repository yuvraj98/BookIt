import 'dotenv/config'
import { createApp } from './app'
import { logger } from './lib/logger'
import { connectRedis } from './lib/redis'

const PORT = parseInt(process.env.PORT || '4000', 10)

async function bootstrap() {
  try {
    // Connect Redis removed for standalone local run
    // await connectRedis()
    // logger.info('✅ Redis connected')

    const app = createApp()

    app.listen(PORT, () => {
      logger.info(`🚀 BookIt API running on http://localhost:${PORT}`)
      logger.info(`📍 Environment: ${process.env.NODE_ENV}`)
    })
  } catch (error) {
    logger.error('❌ Failed to start server', error)
    process.exit(1)
  }
}

bootstrap()
