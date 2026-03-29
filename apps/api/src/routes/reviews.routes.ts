import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// ─── GET /reviews/:eventId — Get reviews for an event ────────
router.get('/:eventId', async (req, res, next) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, user:user_id(name, avatar_url)')
      .eq('event_id', req.params.eventId)
      .order('helpful_votes', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'Failed to fetch reviews', 'DB_ERROR')

    // Get aggregated stats
    const { data: stats } = await supabase
      .from('reviews')
      .select('rating, sentiment')
      .eq('event_id', req.params.eventId)

    let total = 0
    let sum = 0
    const distributions = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    
    ;(stats || []).forEach(r => {
      total++
      sum += r.rating
      if (r.rating >= 1 && r.rating <= 5) {
        distributions[r.rating as keyof typeof distributions]++
      }
    })

    res.json({
      success: true,
      data: {
        reviews,
        stats: {
          total,
          average: total > 0 ? (sum / total).toFixed(1) : 0,
          distributions
        }
      }
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /reviews — Create a review ────────────────────────
const createReviewSchema = z.object({
  event_id: z.string().uuid(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  photos: z.array(z.string().url()).optional()
})

router.post('/', authenticate, validate(createReviewSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { event_id, rating, comment, photos } = req.body

    // Simple sentiment approximation based on rating
    let sentiment = 'neutral'
    if (rating >= 4) sentiment = 'positive'
    if (rating <= 2) sentiment = 'negative'

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        event_id,
        user_id: req.user!.id,
        rating,
        comment,
        photos: photos || [],
        sentiment
      })
      .select()
      .single()

    if (error) throw new AppError(500, 'Failed to create review', 'DB_ERROR')

    res.status(201).json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── POST /reviews/:id/helpful — Mark as helpful ─────────────
router.post('/:id/helpful', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    // In production we'd track who voted to prevent duplicate votes
    const { data: rev } = await supabase.from('reviews').select('helpful_votes').eq('id', req.params.id).single()
    if (!rev) throw new AppError(404, 'Review not found', 'NOT_FOUND')

    const { error } = await supabase
      .from('reviews')
      .update({ helpful_votes: (rev.helpful_votes || 0) + 1 })
      .eq('id', req.params.id)

    if (error) throw new AppError(500, 'Failed to update vote', 'DB_ERROR')

    res.json({ success: true, message: 'Vote recorded' })
  } catch (err) {
    next(err)
  }
})

export { router as reviewsRouter }
