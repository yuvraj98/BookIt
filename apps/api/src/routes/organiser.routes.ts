import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// ─── Schemas ──────────────────────────────────────────────────
const registerSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(200),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
  bank_account: z.string().min(8).max(20).optional().or(z.literal('')),
  bank_ifsc: z
    .string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code')
    .optional()
    .or(z.literal('')),
  description: z.string().max(1000).optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().default('Pune'),
})

const updateSchema = registerSchema.partial()

// ─── POST /organisers/register — Become an organiser ─────────
router.post(
  '/register',
  authenticate,
  validate(registerSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      // Check if already registered
      const { data: existing } = await supabase
        .from('organisers')
        .select('id, verified')
        .eq('user_id', req.user!.id)
        .single()

      if (existing) {
        throw new AppError(
          409,
          existing.verified
            ? 'You are already a verified organiser'
            : 'Your organiser application is pending approval',
          'ORGANISER_EXISTS'
        )
      }

      const {
        business_name,
        gstin,
        bank_account,
        bank_ifsc,
        description,
        website,
        phone,
        address,
        city,
      } = req.body

      // Create organiser record
      const { data: organiser, error } = await supabase
        .from('organisers')
        .insert({
          user_id: req.user!.id,
          business_name,
          gstin: gstin || null,
          bank_account: bank_account || null,
          bank_ifsc: bank_ifsc || null,
          description: description || null,
          website: website || null,
          phone: phone || null,
          address: address || null,
          city,
          verified: false,
          commission_rate: 8.0,
        })
        .select()
        .single()

      if (error) {
        logger.error('Organiser registration error:', error)
        throw new AppError(500, 'Failed to register as organiser', 'REGISTER_FAILED')
      }

      // Update user role to organiser
      await supabase.from('users').update({ role: 'organiser' }).eq('id', req.user!.id)

      logger.info(`New organiser registered: ${business_name} (${req.user!.id})`)

      res.status(201).json({
        success: true,
        data: organiser,
        message: 'Registration successful! Your application is under review.',
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /organisers/me — Get my organiser profile ───────────
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('organisers')
      .select('*')
      .eq('user_id', req.user!.id)
      .single()

    if (error || !data) {
      throw new AppError(404, 'Not registered as organiser', 'NOT_ORGANISER')
    }

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /organisers/me — Update organiser profile ───────────
router.put(
  '/me',
  authenticate,
  validate(updateSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data: existing } = await supabase
        .from('organisers')
        .select('id')
        .eq('user_id', req.user!.id)
        .single()

      if (!existing) {
        throw new AppError(404, 'Not registered as organiser', 'NOT_ORGANISER')
      }

      const { data, error } = await supabase
        .from('organisers')
        .update(req.body)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw new AppError(500, 'Failed to update profile', 'UPDATE_FAILED')

      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /organisers/kyc-upload — Upload KYC document ───────
router.post('/kyc-upload', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: organiser } = await supabase
      .from('organisers')
      .select('id')
      .eq('user_id', req.user!.id)
      .single()

    if (!organiser) {
      throw new AppError(404, 'Register as organiser first', 'NOT_ORGANISER')
    }

    // For now, accept the URL from client-side upload (Supabase Storage)
    const { doc_url, doc_type } = req.body

    if (!doc_url) {
      throw new AppError(400, 'Document URL is required', 'MISSING_DOC')
    }

    const { error } = await supabase
      .from('organisers')
      .update({ kyc_doc_url: doc_url, kyc_doc_type: doc_type || 'aadhaar' })
      .eq('id', organiser.id)

    if (error) throw new AppError(500, 'Failed to save document', 'UPLOAD_FAILED')

    res.json({ success: true, message: 'KYC document uploaded successfully' })
  } catch (err) {
    next(err)
  }
})

// ─── GET /organisers/dashboard/stats — Organiser stats ───────
router.get(
  '/dashboard/stats',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data: organiser } = await supabase
        .from('organisers')
        .select('id, verified')
        .eq('user_id', req.user!.id)
        .single()

      if (!organiser) throw new AppError(404, 'Not a registered organiser', 'NOT_ORGANISER')

      // Get event count
      const { count: totalEvents } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('organiser_id', organiser.id)

      // Get total bookings across organiser's events
      const { data: events } = await supabase
        .from('events')
        .select('id')
        .eq('organiser_id', organiser.id)

      const eventIds = events?.map((e) => e.id) || []
      let totalBookings = 0
      let totalRevenue = 0

      if (eventIds.length > 0) {
        const { data: bookings } = await supabase
          .from('bookings')
          .select('total_amount, status')
          .in('event_id', eventIds)
          .eq('status', 'confirmed')

        totalBookings = bookings?.length || 0
        totalRevenue = bookings?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0
      }

      res.json({
        success: true,
        data: {
          verified: organiser.verified,
          total_events: totalEvents || 0,
          total_bookings: totalBookings,
          total_revenue: totalRevenue,
          pending_payout: Math.round(totalRevenue * 0.92), // After 8% commission
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /organisers/dashboard/analytics — Per-event analytics ─
router.get(
  '/dashboard/analytics',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data: organiser } = await supabase
        .from('organisers')
        .select('id, commission_rate')
        .eq('user_id', req.user!.id)
        .single()

      if (!organiser) throw new AppError(404, 'Not a registered organiser', 'NOT_ORGANISER')

      const { data: events } = await supabase
        .from('events')
        .select('id, title, status, total_capacity, available_seats, min_price, starts_at')
        .eq('organiser_id', organiser.id)
        .order('starts_at', { ascending: false })

      if (!events || events.length === 0) {
        return res.json({ success: true, data: [] })
      }

      const eventIds = events.map(e => e.id)

      const { data: bookings } = await supabase
        .from('bookings')
        .select('event_id, total_amount, status')
        .in('event_id', eventIds)

      const commissionRate = organiser.commission_rate || 0.08

      const analytics = events.map(event => {
        const eventBookings = bookings?.filter(b => b.event_id === event.id) || []
        const confirmed = eventBookings.filter(b => b.status === 'confirmed')
        const revenue = confirmed.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        const ticketsSold = event.total_capacity - event.available_seats

        return {
          id: event.id,
          title: event.title,
          status: event.status,
          starts_at: event.starts_at,
          total_capacity: event.total_capacity,
          tickets_sold: ticketsSold,
          total_bookings: eventBookings.length,
          confirmed_bookings: confirmed.length,
          gross_revenue: revenue,
          commission: Math.round(revenue * commissionRate),
          net_payout: Math.round(revenue * (1 - commissionRate)),
        }
      })

      res.json({ success: true, data: analytics })
    } catch (err) {
      next(err)
    }
  }
)

// ─── Event Schemas ───────────────────────────────────────────
const seatSectionSchema = z.object({
  label: z.string().min(1, 'Section label required').max(100),
  total_seats: z.number().int().min(1),
  price: z.number().int().min(0),
  row_count: z.number().int().min(1).default(1),
  col_count: z.number().int().min(1).default(1),
})

const _createEventBase = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  category: z.enum([
    'comedy', 'music', 'sports', 'workshop', 'festival', 'cinema',
    'theatre', 'food', 'art', 'fitness', 'tech', 'business',
    'kids', 'religious', 'travel', 'gaming', 'nightlife', 'others',
  ]),
  subcategory: z.string().max(100).optional().or(z.literal('')),
  city: z.string().default('Pune'),
  venue_name: z.string().min(2).max(200),
  venue_address: z.string().min(5).max(500),
  venue_lat: z.number().optional(),
  venue_lng: z.number().optional(),
  starts_at: z.string().refine((s) => new Date(s) > new Date(), 'Event must be in the future'),
  ends_at: z.string(),
  poster_url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).max(10).optional(),
  seat_sections: z.array(seatSectionSchema).min(1, 'At least one seat section required'),
})

const createEventSchema = _createEventBase.refine(
  (data) => new Date(data.ends_at) > new Date(data.starts_at),
  { message: 'End time must be after start time', path: ['ends_at'] }
)

const updateEventSchema = _createEventBase.omit({ seat_sections: true }).partial()

// ─── POST /organisers/events — Create event ──────────────────
router.post(
  '/events',
  authenticate,
  validate(createEventSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      // Get organiser
      const { data: organiser } = await supabase
        .from('organisers')
        .select('id, verified')
        .eq('user_id', req.user!.id)
        .single()

      if (!organiser) throw new AppError(404, 'Register as organiser first', 'NOT_ORGANISER')
      if (!organiser.verified) {
        throw new AppError(403, 'Your organiser account is pending verification', 'NOT_VERIFIED')
      }

      const { seat_sections, ...eventData } = req.body

      // Calculate totals
      const totalCapacity = seat_sections.reduce((sum: number, s: { total_seats: number }) => sum + s.total_seats, 0)
      const prices = seat_sections.map((s: { price: number }) => s.price)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          ...eventData,
          organiser_id: organiser.id,
          poster_url: eventData.poster_url || null,
          subcategory: eventData.subcategory || null,
          tags: eventData.tags || [],
          status: 'draft',
          total_capacity: totalCapacity,
          available_seats: totalCapacity,
          min_price: minPrice,
          max_price: maxPrice,
        })
        .select()
        .single()

      if (eventError) {
        logger.error('Event creation error:', eventError)
        throw new AppError(500, 'Failed to create event', 'EVENT_CREATE_FAILED')
      }

      // Create seat sections (with individual seats)
      for (const section of seat_sections) {
        const { data: sectionRow, error: sectionError } = await supabase
          .from('seat_sections')
          .insert({
            event_id: event.id,
            label: section.label,
            total_seats: section.total_seats,
            available_seats: section.total_seats,
            price: section.price,
            row_count: section.row_count,
            col_count: section.col_count,
          })
          .select()
          .single()

        if (sectionError) {
          logger.error('Seat section error:', sectionError)
          continue
        }

        // Generate individual seats
        const seatInserts = []
        for (let row = 1; row <= section.row_count; row++) {
          for (let col = 1; col <= section.col_count; col++) {
            if (seatInserts.length >= section.total_seats) break
            const rowLabel = String.fromCharCode(64 + row) // A, B, C...
            seatInserts.push({
              section_id: sectionRow.id,
              row_number: row,
              col_number: col,
              label: `${rowLabel}${col}`,
              status: 'available',
            })
          }
          if (seatInserts.length >= section.total_seats) break
        }

        if (seatInserts.length > 0) {
          await supabase.from('seats').insert(seatInserts)
        }
      }

      logger.info(`Event created: "${event.title}" by organiser ${organiser.id}`)

      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created as draft. Submit it for approval when ready.',
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /organisers/events — List organiser's events ────────
router.get('/events', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: organiser } = await supabase
      .from('organisers')
      .select('id')
      .eq('user_id', req.user!.id)
      .single()

    if (!organiser) throw new AppError(404, 'Not a registered organiser', 'NOT_ORGANISER')

    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 20, 50)
    const status = req.query.status as string | undefined

    let query = supabase
      .from('events')
      .select('*, seat_sections(id, label, total_seats, available_seats, price)', { count: 'exact' })
      .eq('organiser_id', organiser.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) query = query.eq('status', status)

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

// ─── PUT /organisers/events/:id — Update event ──────────────
router.put(
  '/events/:id',
  authenticate,
  validate(updateEventSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data: organiser } = await supabase
        .from('organisers')
        .select('id')
        .eq('user_id', req.user!.id)
        .single()

      if (!organiser) throw new AppError(404, 'Not a registered organiser', 'NOT_ORGANISER')

      // Verify ownership
      const { data: existing } = await supabase
        .from('events')
        .select('id, status')
        .eq('id', req.params.id)
        .eq('organiser_id', organiser.id)
        .single()

      if (!existing) throw new AppError(404, 'Event not found', 'NOT_FOUND')
      if (existing.status === 'approved') {
        throw new AppError(400, 'Cannot edit an approved event. Contact support.', 'EVENT_LOCKED')
      }

      const { data, error } = await supabase
        .from('events')
        .update(req.body)
        .eq('id', req.params.id)
        .select()
        .single()

      if (error) throw new AppError(500, 'Failed to update event', 'UPDATE_FAILED')

      res.json({ success: true, data })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /organisers/events/:id/submit — Submit for approval
router.post('/events/:id/submit', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: organiser } = await supabase
      .from('organisers')
      .select('id, verified')
      .eq('user_id', req.user!.id)
      .single()

    if (!organiser?.verified) {
      throw new AppError(403, 'Only verified organisers can submit events', 'NOT_VERIFIED')
    }

    const { data: event, error } = await supabase
      .from('events')
      .update({ status: 'pending_approval' })
      .eq('id', req.params.id)
      .eq('organiser_id', organiser.id)
      .eq('status', 'draft')
      .select()
      .single()

    if (error || !event) {
      throw new AppError(404, 'Event not found or cannot be submitted', 'SUBMIT_FAILED')
    }

    logger.info(`Event submitted for approval: "${event.title}" (${event.id})`)

    res.json({
      success: true,
      data: event,
      message: 'Event submitted for approval. We\'ll notify you once reviewed.',
    })
  } catch (err) {
    next(err)
  }
})

export { router as organiserRouter }
