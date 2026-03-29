import { Router } from 'express'
import { AppError } from '../middleware/errorHandler'
import { supabase } from '../lib/supabase'

const router = Router()

// ─── GET /theatres — List theatres by city ────────────────────
router.get('/', async (req, res, next) => {
  try {
    const city = (req.query.city as string) || 'Pune'

    const { data, error } = await supabase
      .from('theatres')
      .select('*, screens(id, screen_number, screen_type, total_rows, total_cols)')
      .eq('city', city)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) throw new AppError(500, 'Failed to fetch theatres', 'DB_ERROR')
    res.json({ success: true, data: data || [] })
  } catch (err) {
    next(err)
  }
})

// ─── GET /theatres/:id — Theatre detail ───────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('theatres')
      .select('*, screens(*, screen_seats(*))')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new AppError(404, 'Theatre not found', 'NOT_FOUND')
    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

export { router as theatresRouter }
