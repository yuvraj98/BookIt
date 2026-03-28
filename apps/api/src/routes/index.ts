import { Router } from 'express'
import { authRouter } from './auth.routes'
import { eventsRouter } from './events.routes'
import { organiserRouter } from './organiser.routes'
import { adminRouter } from './admin.routes'
import { bookingsRouter } from './bookings.routes'

const router = Router()

// ─── Mount all routes ─────────────────────────────────────────
router.use('/auth', authRouter)
router.use('/events', eventsRouter)
router.use('/organisers', organiserRouter)
router.use('/admin', adminRouter)
router.use('/bookings', bookingsRouter)

export { router as apiRouter }

