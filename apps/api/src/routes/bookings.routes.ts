import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// All booking routes require authentication
router.use(authenticate)

// ─── Schemas ──────────────────────────────────────────────────
const createBookingSchema = z.object({
  event_id: z.string().uuid(),
  seat_ids: z.array(z.string().uuid()).min(1, 'Select at least one seat').max(10),
})

const confirmBookingSchema = z.object({
  razorpay_payment_id: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// ─── POST /bookings — Create a new booking ───────────────────
router.post('/', validate(createBookingSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { event_id, seat_ids } = req.body

    // 1. Get the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, organisers(commission_rate)')
      .eq('id', event_id)
      .eq('status', 'approved')
      .single()

    if (eventError || !event) {
      throw new AppError(404, 'Event not found or not available', 'EVENT_NOT_FOUND')
    }

    // Check event hasn't started yet
    if (new Date(event.starts_at) < new Date()) {
      throw new AppError(400, 'Event has already started', 'EVENT_STARTED')
    }

    // 2. Verify all seats exist and are available
    const { data: seats, error: seatsError } = await supabase
      .from('seats')
      .select('*, seat_sections!inner(event_id, price)')
      .in('id', seat_ids)
      .eq('seat_sections.event_id', event_id)
      .eq('status', 'available')

    if (seatsError || !seats || seats.length !== seat_ids.length) {
      throw new AppError(
        409,
        'One or more seats are unavailable. Please select different seats.',
        'SEATS_UNAVAILABLE'
      )
    }

    // 3. Calculate pricing
    const amount = seats.reduce((sum, seat) => sum + (seat.seat_sections?.price || 0), 0)
    const convenienceFee = Math.round(amount * 0.029) // 2.9% convenience fee
    const totalAmount = amount + convenienceFee
    const qrToken = uuidv4()

    // 4. Lock seats (update to 'locked')
    const { error: lockError } = await supabase
      .from('seats')
      .update({ status: 'locked' })
      .in('id', seat_ids)
      .eq('status', 'available')

    if (lockError) {
      throw new AppError(500, 'Failed to lock seats', 'LOCK_FAILED')
    }

    // 5. Create booking
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: req.user!.id,
        event_id,
        seat_ids,
        amount,
        convenience_fee: convenienceFee,
        total_amount: totalAmount,
        status: 'pending',
        qr_token: qrToken,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (bookingError) {
      // Rollback: unlock seats
      await supabase.from('seats').update({ status: 'available' }).in('id', seat_ids)
      logger.error('Booking creation error:', bookingError)
      throw new AppError(500, 'Failed to create booking', 'BOOKING_FAILED')
    }

    // 6. Update available_seats on seat_sections
    const sectionUpdates = new Map<string, number>()
    seats.forEach((seat) => {
      const current = sectionUpdates.get(seat.section_id) || 0
      sectionUpdates.set(seat.section_id, current + 1)
    })

    for (const [sectionId, count] of sectionUpdates) {
      await supabase.rpc('decrement_available_seats', {
        p_section_id: sectionId,
        p_count: count,
      })
    }

    logger.info(`Booking created: ${booking.id} by user ${req.user!.id} for event ${event_id}`)

    res.status(201).json({
      success: true,
      data: {
        ...booking,
        event_title: event.title,
        seats: seats.map((s) => ({
          id: s.id,
          label: s.label,
          price: s.seat_sections?.price,
        })),
      },
      message: `Booking created! Complete payment within 15 minutes.`,
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /bookings/:id/confirm — Confirm payment ───────────
router.post(
  '/:id/confirm',
  validate(confirmBookingSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { razorpay_payment_id, razorpay_order_id } = req.body

      // Get booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .eq('status', 'pending')
        .single()

      if (error || !booking) {
        throw new AppError(404, 'Booking not found or already processed', 'BOOKING_NOT_FOUND')
      }

      // Check expiry
      if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
        // Expired — release seats and cancel booking
        await supabase.from('seats').update({ status: 'available' }).in('id', booking.seat_ids)
        await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)
        throw new AppError(410, 'Booking expired. Seats have been released.', 'BOOKING_EXPIRED')
      }

      // Update booking to confirmed
      const { data: confirmed, error: updateError } = await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          payment_id: razorpay_payment_id,
          razorpay_order_id,
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', booking.id)
        .select()
        .single()

      if (updateError) throw new AppError(500, 'Failed to confirm booking', 'CONFIRM_FAILED')

      // Update seats to 'booked'
      await supabase.from('seats').update({ status: 'booked' }).in('id', booking.seat_ids)

      // Create payment record
      const commissionRate = 0.08 // 8% default
      const organiserPayout = Math.round(booking.amount * (1 - commissionRate))

      await supabase.from('payments').insert({
        booking_id: booking.id,
        razorpay_payment_id,
        razorpay_order_id,
        amount: booking.total_amount,
        fee: booking.convenience_fee,
        organiser_payout: organiserPayout,
        status: 'captured',
      })

      // Award loyalty coins (1 coin per ₹100 spent)
      const coinsEarned = Math.floor(booking.total_amount / 100)
      if (coinsEarned > 0) {
        await supabase.rpc('increment_loyalty_coins', {
          p_user_id: req.user!.id,
          p_coins: coinsEarned,
        })
      }

      logger.info(`Booking confirmed: ${booking.id} — payment: ${razorpay_payment_id}`)

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

// ─── GET /bookings/mine — List user's bookings ───────────────
router.get('/mine', async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 10, 50)
    const status = req.query.status as string | undefined

    let query = supabase
      .from('bookings')
      .select('*, events(title, venue_name, city, starts_at, poster_url)', { count: 'exact' })
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (status) query = query.eq('status', status)

    const { data, error, count } = await query

    if (error) throw new AppError(500, 'Failed to fetch bookings', 'DB_ERROR')

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

// ─── GET /bookings/:id — Single booking detail ──────────────
router.get('/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, events(title, venue_name, venue_address, city, starts_at, ends_at, poster_url, organisers(business_name))')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single()

    if (error || !data) throw new AppError(404, 'Booking not found', 'NOT_FOUND')

    // Get seat details
    const { data: seats } = await supabase
      .from('seats')
      .select('id, label, seat_sections(label, price)')
      .in('id', data.seat_ids)

    res.json({
      success: true,
      data: { ...data, seats: seats || [] },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /bookings/:id/cancel — Cancel booking ─────────────
router.post('/:id/cancel', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .in('status', ['pending', 'confirmed'])
      .single()

    if (error || !booking) {
      throw new AppError(404, 'Booking not found or cannot be cancelled', 'NOT_FOUND')
    }

    // Cancel booking
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id)

    // Release seats
    await supabase.from('seats').update({ status: 'available' }).in('id', booking.seat_ids)

    // Restore section available_seats
    const { data: seats } = await supabase
      .from('seats')
      .select('section_id')
      .in('id', booking.seat_ids)

    const sectionUpdates = new Map<string, number>()
    seats?.forEach((seat) => {
      const current = sectionUpdates.get(seat.section_id) || 0
      sectionUpdates.set(seat.section_id, current + 1)
    })

    for (const [sectionId, count] of sectionUpdates) {
      await supabase.rpc('increment_available_seats', {
        p_section_id: sectionId,
        p_count: count,
      })
    }

    logger.info(`Booking cancelled: ${booking.id} by user ${req.user!.id}`)

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released.',
    })
  } catch (err) {
    next(err)
  }
})

export { router as bookingsRouter }
