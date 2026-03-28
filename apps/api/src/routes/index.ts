import { Router } from 'express'
import { authRouter } from './auth.routes'
import { eventsRouter } from './events.routes'

const router = Router()

// ─── Mount all routes ─────────────────────────────────────────
router.use('/auth', authRouter)
router.use('/events', eventsRouter)

export { router as apiRouter }
