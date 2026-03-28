import { Router } from 'express'
import { authRouter } from './auth.routes'
import { eventsRouter } from './events.routes'
import { organiserRouter } from './organiser.routes'
import { adminRouter } from './admin.routes'
import { bookingsRouter } from './bookings.routes'
import { wishlistRouter } from './wishlist.routes'
import { notificationsRouter } from './notifications.routes'
import { promoRouter } from './promo.routes'
import { referralRouter } from './referral.routes'
import { reviewsRouter } from './reviews.routes'
import { moviesRouter } from './movies.routes'
import { theatresRouter } from './theatres.routes'
import { showsRouter } from './shows.routes'

const router = Router()

// ─── Mount all routes ─────────────────────────────────────────
router.use('/auth', authRouter)
router.use('/events', eventsRouter)
router.use('/organisers', organiserRouter)
router.use('/admin', adminRouter)
router.use('/bookings', bookingsRouter)
router.use('/wishlist', wishlistRouter)
router.use('/notifications', notificationsRouter)
router.use('/promo', promoRouter)
router.use('/referrals', referralRouter)
router.use('/reviews', reviewsRouter)
router.use('/movies', moviesRouter)
router.use('/theatres', theatresRouter)
router.use('/shows', showsRouter)

export { router as apiRouter }
