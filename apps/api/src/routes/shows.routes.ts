import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// ─── GET /shows/:id — Show detail with theatre + movie info ──
router.get('/:id', async (req, res, next) => {
  try {
    const { data: show, error } = await supabase
      .from('shows')
      .select(`
        id, show_date, show_time, language, subtitle_lang,
        price_recliner, price_gold, price_silver, price_economy,
        movies(id, title, duration_minutes, poster_url, cbfc_rating, genre, language, director, cast_members),
        screens(
          id, screen_number, screen_type, total_rows, total_cols,
          theatres(id, name, address, city, amenities)
        )
      `)
      .eq('id', req.params.id)
      .single()

    if (error || !show) throw new AppError(404, 'Show not found', 'NOT_FOUND')

    res.json({ success: true, data: show })
  } catch (err) {
    next(err)
  }
})

// ─── GET /shows/:id/seats — Seats for a specific show ────────
router.get('/:id/seats', async (req, res, next) => {
  try {
    // First release any expired locks
    await supabase.rpc('release_expired_movie_locks').catch(() => {})

    const { data, error } = await supabase
      .from('show_seats')
      .select('id, label, row_label, col_number, category, price, status')
      .eq('show_id', req.params.id)
      .order('row_label', { ascending: true })
      .order('col_number', { ascending: true })

    if (error) throw new AppError(500, 'Failed to fetch seats', 'DB_ERROR')

    // Group by row
    const rows = new Map<string, any[]>()
    for (const seat of data || []) {
      if (!rows.has(seat.row_label)) rows.set(seat.row_label, [])
      rows.get(seat.row_label)!.push(seat)
    }

    // Also return category summary
    const categoryStats = (data || []).reduce(
      (acc, s) => {
        if (!acc[s.category]) acc[s.category] = { total: 0, available: 0, price: s.price }
        acc[s.category].total++
        if (s.status === 'available') acc[s.category].available++
        return acc
      },
      {} as Record<string, { total: number; available: number; price: number }>
    )

    res.json({
      success: true,
      data: {
        seats: data || [],
        rows: Array.from(rows.entries()).map(([label, seats]) => ({ label, seats })),
        category_stats: categoryStats,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── Schemas ──────────────────────────────────────────────────
const createMovieBookingSchema = z.object({
  show_id: z.string().uuid(),
  seat_ids: z.array(z.string().uuid()).min(1).max(10),
})

const confirmMovieBookingSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// ─── POST /shows/book — Create movie booking ─────────────────
router.post(
  '/book',
  authenticate,
  validate(createMovieBookingSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { show_id, seat_ids } = req.body

      // 1. Verify show exists and is active
      const { data: show, error: showErr } = await supabase
        .from('shows')
        .select(`*, 
          movies(id, title), 
          screens(theatres(name))
        `)
        .eq('id', show_id)
        .eq('is_active', true)
        .single()

      if (showErr || !show) throw new AppError(404, 'Show not found or not available', 'SHOW_NOT_FOUND')

      // Check show hasn't passed
      const showDateTime = new Date(`${show.show_date}T${show.show_time}`)
      if (showDateTime < new Date()) {
        throw new AppError(400, 'This show has already passed', 'SHOW_PASSED')
      }

      // 2. Verify all seats are available
      const { data: seats, error: seatsErr } = await supabase
        .from('show_seats')
        .select('id, label, category, price, status')
        .in('id', seat_ids)
        .eq('show_id', show_id)
        .eq('status', 'available')

      if (seatsErr || !seats || seats.length !== seat_ids.length) {
        throw new AppError(
          409,
          'One or more seats are unavailable. Please select different seats.',
          'SEATS_UNAVAILABLE'
        )
      }

      // 3. Lock seats
      const { error: lockErr } = await supabase.rpc('lock_show_seats', {
        p_show_id: show_id,
        p_seat_ids: seat_ids,
      })
      if (lockErr) throw new AppError(500, 'Failed to lock seats', 'LOCK_FAILED')

      // 4. Calculate totals
      const baseAmount = seats.reduce((sum, s) => sum + s.price, 0)
      const convenienceFee = Math.round(baseAmount * 0.03)
      const totalAmount = baseAmount + convenienceFee

      // 5. Create booking
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      const qrToken = `MBK-${uuidv4().slice(0, 8).toUpperCase()}`

      const { data: booking, error: bookingErr } = await supabase
        .from('movie_bookings')
        .insert({
          user_id: req.user!.id,
          show_id,
          seat_ids,
          amount: baseAmount,
          convenience_fee: convenienceFee,
          total_amount: totalAmount,
          status: 'pending',
          qr_token: qrToken,
          expires_at: expiresAt,
        })
        .select()
        .single()

      if (bookingErr) {
        // Rollback locks
        await supabase
          .from('show_seats')
          .update({ status: 'available', locked_at: null })
          .in('id', seat_ids)
        throw new AppError(500, 'Failed to create booking', 'BOOKING_FAILED')
      }

      logger.info(`Movie booking created: ${booking.id}`)

      res.status(201).json({
        success: true,
        data: {
          ...booking,
          movie_title: (show.movies as any)?.title,
          theatre_name: (show.screens as any)?.theatres?.name,
          show_time: show.show_time,
          show_date: show.show_date,
          seats: seats.map((s) => ({ id: s.id, label: s.label, category: s.category, price: s.price })),
        },
        message: `Seats locked! Complete payment within 15 minutes.`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /shows/book/:id/confirm — Confirm movie booking ────
router.post(
  '/book/:id/confirm',
  authenticate,
  validate(confirmMovieBookingSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { razorpay_payment_id, razorpay_order_id } = req.body

      // Get booking
      const { data: booking, error } = await supabase
        .from('movie_bookings')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .eq('status', 'pending')
        .single()

      if (error || !booking) throw new AppError(404, 'Booking not found', 'NOT_FOUND')

      // Check expiry
      if (new Date(booking.expires_at) < new Date()) {
        await supabase
          .from('show_seats')
          .update({ status: 'available', locked_at: null })
          .in('id', booking.seat_ids)
        await supabase.from('movie_bookings').update({ status: 'cancelled' }).eq('id', booking.id)
        throw new AppError(410, 'Booking has expired. Please try again.', 'BOOKING_EXPIRED')
      }

      // Confirm seats & booking
      await supabase.rpc('confirm_show_seats', {
        p_show_id: booking.show_id,
        p_seat_ids: booking.seat_ids,
      })

      const { data: confirmed, error: confirmErr } = await supabase
        .from('movie_bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)
        .select()
        .single()

      if (confirmErr) throw new AppError(500, 'Failed to confirm booking', 'CONFIRM_FAILED')

      // Award loyalty coins
      const coinsEarned = Math.floor(booking.total_amount / 100)
      if (coinsEarned > 0) {
        await supabase.rpc('increment_loyalty_coins', {
          p_user_id: req.user!.id,
          p_coins: coinsEarned,
        })
      }

      // Create notification
      await supabase.from('notifications').insert({
        user_id: req.user!.id,
        type: 'movie_booking_confirmed',
        channel: 'email',
        payload: {
          title: 'Movie Booking Confirmed! 🎬',
          message: `Your tickets are confirmed. You earned ${coinsEarned} loyalty coins!`,
          booking_id: booking.id,
        },
      })

      logger.info(`Movie booking confirmed: ${booking.id}`)

      res.json({
        success: true,
        data: confirmed,
        message: `Booking confirmed! You earned ${coinsEarned} loyalty coins.`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /shows/bookings/mine — User's movie bookings ─────────
router.get(
  '/bookings/mine',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data, error } = await supabase
        .from('movie_bookings')
        .select(`
          *,
          shows(
            show_date, show_time, language,
            movies(id, title, poster_url, duration_minutes, genre),
            screens(screen_type, theatres(name, city, address))
          )
        `)
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw new AppError(500, 'Failed to fetch bookings', 'DB_ERROR')

      res.json({ success: true, data: data || [] })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /shows/bookings/:id — Single movie booking detail ────
router.get(
  '/bookings/:id',
  authenticate,
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { data, error } = await supabase
        .from('movie_bookings')
        .select(`
          *,
          shows(
            show_date, show_time, language, subtitle_lang,
            movies(id, title, poster_url, duration_minutes, genre, cbfc_rating),
            screens(screen_number, screen_type, theatres(name, city, address))
          )
        `)
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .single()

      if (error || !data) throw new AppError(404, 'Booking not found', 'NOT_FOUND')

      // Get seat details
      const { data: seatData } = await supabase
        .from('show_seats')
        .select('id, label, row_label, category, price')
        .in('id', data.seat_ids)

      res.json({ success: true, data: { ...data, seat_details: seatData || [] } })
    } catch (err) {
      next(err)
    }
  }
)

export { router as showsRouter }
