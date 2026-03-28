import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// ─── Schemas ────────────────────────────────────────────────
const eventFiltersSchema = z.object({
  city: z.string().optional(),
  category: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  search: z.string().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
  featured: z.coerce.boolean().optional(),
})

// ─── GET /events ─────────────────────────────────────────────
router.get('/', validate(eventFiltersSchema, 'query'), async (req, res, next) => {
  try {
    const { city, category, date_from, date_to, price_min, price_max, page, limit, featured } =
      req.query as z.infer<typeof eventFiltersSchema>

    let query = supabase
      .from('events')
      .select('*, organisers(business_name)', { count: 'exact' })
      .eq('status', 'approved')
      .order('starts_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1)

    if (city) query = query.eq('city', city)
    if (category) query = query.eq('category', category)
    if (date_from) query = query.gte('starts_at', date_from)
    if (date_to) query = query.lte('starts_at', date_to)
    if (price_min !== undefined) query = query.gte('min_price', price_min)
    if (price_max !== undefined) query = query.lte('max_price', price_max)
    if (featured) query = query.eq('is_featured', true)

    const { data, error, count } = await query

    if (error) throw new AppError(500, 'Failed to fetch events', 'DB_ERROR')

    res.json({
      success: true,
      data: {
        items: data || [],
        total: count || 0,
        page,
        limit,
        has_more: (count || 0) > page * limit,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /events/:id ─────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, organisers(business_name, user_id), seat_sections(*)')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new AppError(404, 'Event not found', 'EVENT_NOT_FOUND')

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── GET /events/:id/seats ─────────────────────────────────
router.get('/:id/seats', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('seats')
      .select('*, seat_sections!inner(event_id)')
      .eq('seat_sections.event_id', req.params.id)

    if (error) throw new AppError(500, 'Failed to fetch seats', 'DB_ERROR')

    res.json({ success: true, data: data || [] })
  } catch (err) {
    next(err)
  }
})

export { router as eventsRouter }
