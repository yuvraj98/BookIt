import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, requireRole, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// All admin routes require admin role
router.use(authenticate)
router.use(requireRole('admin'))

// ─── GET /admin/organisers — List all organisers ─────────────
const listOrganisersSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
  status: z.enum(['all', 'pending', 'verified', 'rejected']).default('all'),
  search: z.string().optional(),
})

router.get(
  '/organisers',
  validate(listOrganisersSchema, 'query'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, status, search } = req.query as unknown as z.infer<typeof listOrganisersSchema>

      let query = supabase
        .from('organisers')
        .select('*, users(name, phone, email, avatar_url)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status === 'pending') query = query.eq('verified', false).is('rejected_at', null)
      else if (status === 'verified') query = query.eq('verified', true)
      else if (status === 'rejected') query = query.not('rejected_at', 'is', null)

      if (search) {
        query = query.or(
          `business_name.ilike.%${search}%,gstin.ilike.%${search}%`
        )
      }

      const { data, error, count } = await query

      if (error) throw new AppError(500, 'Failed to fetch organisers', 'DB_ERROR')

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
  }
)

// ─── GET /admin/organisers/:id — Single organiser detail ─────
router.get('/organisers/:id', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('organisers')
      .select('*, users(name, phone, email, avatar_url, created_at)')
      .eq('id', req.params.id)
      .single()

    if (error || !data) throw new AppError(404, 'Organiser not found', 'NOT_FOUND')

    // Get their event count
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('organiser_id', req.params.id)

    res.json({
      success: true,
      data: { ...data, event_count: eventCount || 0 },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /admin/organisers/:id/approve — Approve organiser ──
const approveSchema = z.object({
  commission_rate: z.number().min(0).max(30).optional(),
  note: z.string().max(500).optional(),
})

router.post(
  '/organisers/:id/approve',
  validate(approveSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { commission_rate, note } = req.body

      const updateData: Record<string, unknown> = {
        verified: true,
        verified_at: new Date().toISOString(),
        verified_by: req.user!.id,
        rejected_at: null,
        rejection_reason: null,
      }
      if (commission_rate !== undefined) updateData.commission_rate = commission_rate

      const { data, error } = await supabase
        .from('organisers')
        .update(updateData)
        .eq('id', req.params.id)
        .select('*, users(name, phone)')
        .single()

      if (error) throw new AppError(500, 'Failed to approve organiser', 'DB_ERROR')
      if (!data) throw new AppError(404, 'Organiser not found', 'NOT_FOUND')

      // Update user role
      await supabase.from('users').update({ role: 'organiser' }).eq('id', data.user_id)

      // Audit log
      await supabase.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: 'organiser_approved',
        target_id: req.params.id,
        target_type: 'organiser',
        reason: note || 'Approved',
        meta: { commission_rate: data.commission_rate },
      })

      logger.info(`Organiser approved: ${data.business_name} by admin ${req.user!.id}`)

      res.json({
        success: true,
        data,
        message: `${data.business_name} has been approved`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /admin/organisers/:id/reject — Reject organiser ────
const rejectSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
})

router.post(
  '/organisers/:id/reject',
  validate(rejectSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { reason } = req.body

      const { data, error } = await supabase
        .from('organisers')
        .update({
          verified: false,
          rejected_at: new Date().toISOString(),
          rejected_by: req.user!.id,
          rejection_reason: reason,
        })
        .eq('id', req.params.id)
        .select('*, users(name, phone)')
        .single()

      if (error) throw new AppError(500, 'Failed to reject organiser', 'DB_ERROR')
      if (!data) throw new AppError(404, 'Organiser not found', 'NOT_FOUND')

      // Audit log
      await supabase.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: 'organiser_rejected',
        target_id: req.params.id,
        target_type: 'organiser',
        reason,
      })

      logger.info(`Organiser rejected: ${data.business_name} — reason: ${reason}`)

      res.json({
        success: true,
        data,
        message: `${data.business_name} has been rejected`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /admin/stats — Admin dashboard overview ─────────────
router.get('/stats', async (_req: AuthenticatedRequest, res, next) => {
  try {
    const [
      { count: totalUsers },
      { count: totalOrganisers },
      { count: pendingOrganisers },
      { count: totalEvents },
      { count: approvedEvents },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('organisers').select('*', { count: 'exact', head: true }),
      supabase
        .from('organisers')
        .select('*', { count: 'exact', head: true })
        .eq('verified', false)
        .is('rejected_at', null),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
    ])

    // Total GMV from confirmed bookings
    const { data: bookingAgg } = await supabase
      .from('bookings')
      .select('total_amount')
      .eq('status', 'confirmed')

    const totalGMV = bookingAgg?.reduce((s, b) => s + (b.total_amount || 0), 0) || 0

    res.json({
      success: true,
      data: {
        total_users: totalUsers || 0,
        total_organisers: totalOrganisers || 0,
        pending_organisers: pendingOrganisers || 0,
        total_events: totalEvents || 0,
        approved_events: approvedEvents || 0,
        total_gmv: totalGMV,
        platform_revenue: Math.round(totalGMV * 0.08),
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /admin/events — List all events for moderation ──────
const listEventsSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().max(50).default(20),
  status: z.enum(['all', 'draft', 'pending_approval', 'approved', 'rejected', 'cancelled', 'completed']).default('all'),
  search: z.string().optional(),
})

router.get(
  '/events',
  validate(listEventsSchema, 'query'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { page, limit, status, search } = req.query as unknown as z.infer<typeof listEventsSchema>

      let query = supabase
        .from('events')
        .select('*, organisers(business_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status !== 'all') query = query.eq('status', status)

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,venue_name.ilike.%${search}%,city.ilike.%${search}%`
        )
      }

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
  }
)

// ─── POST /admin/events/:id/approve — Approve event ─────────
const approveEventSchema = z.object({
  note: z.string().max(500).optional(),
})

router.post(
  '/events/:id/approve',
  validate(approveEventSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { note } = req.body

      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'approved',
        })
        .eq('id', req.params.id)
        .in('status', ['pending_approval', 'draft'])
        .select('*, organisers(business_name)')
        .single()

      if (error) throw new AppError(500, 'Failed to approve event', 'DB_ERROR')
      if (!data) throw new AppError(404, 'Event not found or cannot be approved', 'NOT_FOUND')

      // Audit log
      await supabase.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: 'event_approved',
        target_id: req.params.id,
        target_type: 'event',
        reason: note || 'Approved',
      })

      logger.info(`Event approved: "${data.title}" by admin ${req.user!.id}`)

      res.json({
        success: true,
        data,
        message: `"${data.title}" has been approved and is now live`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /admin/events/:id/reject — Reject event ──────────
const rejectEventSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
})

router.post(
  '/events/:id/reject',
  validate(rejectEventSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { reason } = req.body

      const { data, error } = await supabase
        .from('events')
        .update({
          status: 'cancelled',
        })
        .eq('id', req.params.id)
        .select('*, organisers(business_name)')
        .single()

      if (error) throw new AppError(500, 'Failed to reject event', 'DB_ERROR')
      if (!data) throw new AppError(404, 'Event not found', 'NOT_FOUND')

      // Audit log
      await supabase.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: 'event_rejected',
        target_id: req.params.id,
        target_type: 'event',
        reason,
      })

      logger.info(`Event rejected: "${data.title}" — reason: ${reason}`)

      res.json({
        success: true,
        data,
        message: `"${data.title}" has been rejected`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── POST /admin/events/:id/takedown — Take down approved event
const takedownEventSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
})

router.post(
  '/events/:id/takedown',
  validate(takedownEventSchema),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      const { reason } = req.body

      const { data, error } = await supabase
        .from('events')
        .update({ status: 'cancelled' })
        .eq('id', req.params.id)
        .eq('status', 'approved')
        .select('*, organisers(business_name)')
        .single()

      if (error) throw new AppError(500, 'Failed to take down event', 'DB_ERROR')
      if (!data) throw new AppError(404, 'Event not found or not currently live', 'NOT_FOUND')

      // Audit log
      await supabase.from('admin_logs').insert({
        admin_id: req.user!.id,
        action: 'event_takedown',
        target_id: req.params.id,
        target_type: 'event',
        reason,
      })

      logger.info(`Event taken down: "${data.title}" — reason: ${reason}`)

      res.json({
        success: true,
        data,
        message: `"${data.title}" has been taken down`,
      })
    } catch (err) {
      next(err)
    }
  }
)

// ─── GET /admin/logs — Audit log ─────────────────────────────
router.get('/logs', async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Math.min(Number(req.query.limit) || 20, 50)

    const { data, error, count } = await supabase
      .from('admin_logs')
      .select('*, users:admin_id(name, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (error) throw new AppError(500, 'Failed to fetch logs', 'DB_ERROR')

    res.json({
      success: true,
      data: {
        items: data || [],
        total: count || 0,
        page,
        limit,
      },
    })
  } catch (err) {
    next(err)
  }
})

export { router as adminRouter }
