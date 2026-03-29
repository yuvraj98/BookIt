import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'

import { logger } from './lib/logger'
import { apiRouter } from './routes'
import { errorHandler } from './middleware/errorHandler'
import { notFound } from './middleware/notFound'

export function createApp(): Application {
  const app = express()

  // ─── Security headers ──────────────────────────────────────
  app.use(helmet())

  // ─── CORS ─────────────────────────────────────────────────
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',')
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    })
  )

  // ─── Compression ───────────────────────────────────────────
  app.use(compression())

  // ─── Body parsers ─────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // ─── Request logging ──────────────────────────────────────
  app.use(
    morgan('combined', {
      stream: { write: (message) => logger.http(message.trim()) },
      skip: () => process.env.NODE_ENV === 'test',
    })
  )

  // ─── Global rate limit ────────────────────────────────────
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, error: 'Too many requests. Please try again later.' },
    })
  )

  // ─── Root & Health check ──────────────────────────────────
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      message: 'Welcome to BookIt API',
      status: 'active',
      docs: '/api/v1',
    })
  })

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'BookIt API',
      version: process.env.API_VERSION || 'v1',
      timestamp: new Date().toISOString(),
    })
  })

  // ─── API routes ────────────────────────────────────────────
  app.use('/api/v1', apiRouter)

  // ─── Error handling ────────────────────────────────────────
  app.use(notFound)
  app.use(errorHandler)

  return app
}
