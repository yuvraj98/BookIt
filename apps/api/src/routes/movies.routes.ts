import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// ─── Schemas ──────────────────────────────────────────────────
const moviesQuerySchema = z.object({
  city: z.string().optional(),
  status: z.enum(['now_showing', 'coming_soon', 'ended']).optional(),
  genre: z.string().optional(),
  language: z.string().optional(),
  search: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
})

// ─── GET /movies — List all movies ─────────────────────────────
router.get('/', validate(moviesQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { status, genre, language, search, featured, page, limit } =
      req.query as unknown as z.infer<typeof moviesQuerySchema>

    let query = supabase
      .from('movies')
      .select('*', { count: 'exact' })
      .order('is_featured', { ascending: false })
      .order('release_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) query = query.eq('status', status)
    if (language) query = query.eq('language', language)
    if (featured) query = query.eq('is_featured', true)
    if (genre) query = query.contains('genre', [genre])
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error, count } = await query
    if (error) throw new AppError(500, 'Failed to fetch movies', 'DB_ERROR')

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

// ─── GET /movies/:id — Single movie detail ────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new AppError(404, 'Movie not found', 'NOT_FOUND')

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── GET /movies/:id/shows?date=YYYY-MM-DD&city=Pune ──────────
router.get('/:id/shows', async (req, res, next) => {
  try {
    const { date, city } = req.query as { date?: string; city?: string }
    const showDate = date || new Date().toISOString().split('T')[0]

    // Get shows for this movie on the given date
    const { data: shows, error } = await supabase
      .from('shows')
      .select(`
        id, show_date, show_time, language, subtitle_lang,
        price_recliner, price_gold, price_silver, price_economy, is_active,
        screens!inner(
          id, screen_number, screen_type, total_rows, total_cols,
          theatres!inner(id, name, address, city, amenities)
        )
      `)
      .eq('movie_id', req.params.id)
      .eq('show_date', showDate)
      .eq('is_active', true)
      .order('show_time', { ascending: true })

    if (error) throw new AppError(500, 'Failed to fetch shows', 'DB_ERROR')

    // Group by theatre
    const byTheatre = new Map<string, any>()
    for (const show of shows || []) {
      const screen = show.screens as any
      const theatre = screen.theatres
      const theatreId = theatre.id

      if (!city || theatre.city.toLowerCase() === city.toLowerCase()) {
        if (!byTheatre.has(theatreId)) {
          byTheatre.set(theatreId, {
            theatre: { ...theatre },
            shows: [],
          })
        }
        byTheatre.get(theatreId).shows.push({
          id: show.id,
          show_time: show.show_time,
          show_date: show.show_date,
          language: show.language,
          subtitle_lang: show.subtitle_lang,
          screen_type: screen.screen_type,
          screen_number: screen.screen_number,
          prices: {
            RECLINER: show.price_recliner,
            GOLD: show.price_gold,
            SILVER: show.price_silver,
            ECONOMY: show.price_economy,
          },
        })
      }
    }

    res.json({
      success: true,
      data: {
        date: showDate,
        theatres: Array.from(byTheatre.values()),
      },
    })
  } catch (err) {
    next(err)
  }
})

export { router as moviesRouter }
