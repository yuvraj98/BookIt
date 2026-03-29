import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// All wishlist routes require authentication
router.use(authenticate)

// ─── GET /wishlist — Get user's wishlist ─────────────────────
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        events (
          id, title, category, city, venue_name, starts_at, poster_url, min_price,
          organisers ( business_name )
        )
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'Failed to fetch wishlist', 'WISHLIST_FETCH_FAILED')

    // Filter out any null events (deleted events)
    const items = (data || []).filter((w: any) => w.events !== null)

    res.json({ success: true, data: items })
  } catch (err) {
    next(err)
  }
})

// ─── POST /wishlist/:eventId — Add to wishlist ───────────────
router.post('/:eventId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { eventId } = req.params

    // Check event exists
    const { data: event } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single()

    if (!event) throw new AppError(404, 'Event not found', 'EVENT_NOT_FOUND')

    // Check if already in wishlist
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('event_id', eventId)
      .single()

    if (existing) {
      return res.json({ success: true, message: 'Already in wishlist' })
    }

    const { error } = await supabase
      .from('wishlists')
      .insert({ user_id: req.user!.id, event_id: eventId })

    if (error) throw new AppError(500, 'Failed to add to wishlist', 'WISHLIST_ADD_FAILED')

    res.status(201).json({ success: true, message: 'Added to wishlist' })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /wishlist/:eventId — Remove from wishlist ────────
router.delete('/:eventId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { eventId } = req.params

    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', req.user!.id)
      .eq('event_id', eventId)

    if (error) throw new AppError(500, 'Failed to remove from wishlist', 'WISHLIST_REMOVE_FAILED')

    res.json({ success: true, message: 'Removed from wishlist' })
  } catch (err) {
    next(err)
  }
})

// ─── GET /wishlist/check/:eventId — Check if in wishlist ─────
router.get('/check/:eventId', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { eventId } = req.params

    const { data } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('event_id', eventId)
      .single()

    res.json({ success: true, data: { wishlisted: !!data } })
  } catch (err) {
    next(err)
  }
})

export { router as wishlistRouter }
