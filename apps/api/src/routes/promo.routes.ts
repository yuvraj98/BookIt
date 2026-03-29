import { Router } from 'express'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// ─── POST /promo/validate — Check a code ─────────────────────
const validatePromoSchema = z.object({
  code: z.string().min(1).max(20).transform(v => v.toUpperCase()),
  event_id: z.string().uuid().optional(),
  amount: z.number().min(1),
})

router.post('/validate', authenticate, validate(validatePromoSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, event_id, amount } = req.body

    const { data: promo, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !promo) {
      throw new AppError(404, 'Invalid promo code', 'PROMO_NOT_FOUND')
    }

    // Check validity period
    if (promo.valid_until && new Date(promo.valid_until) < new Date()) {
      throw new AppError(410, 'Promo code has expired', 'PROMO_EXPIRED')
    }
    if (new Date(promo.valid_from) > new Date()) {
      throw new AppError(400, 'Promo code is not yet active', 'PROMO_NOT_ACTIVE')
    }

    // Check usage limit
    if (promo.max_uses && promo.used_count >= promo.max_uses) {
      throw new AppError(410, 'Promo code has been fully redeemed', 'PROMO_EXHAUSTED')
    }

    // Check minimum order
    if (amount < promo.min_order) {
      throw new AppError(400, `Minimum order of ₹${promo.min_order} required`, 'MIN_ORDER_NOT_MET')
    }

    // Check event-specific promo
    if (promo.event_id && event_id && promo.event_id !== event_id) {
      throw new AppError(400, 'This promo code is not valid for this event', 'PROMO_EVENT_MISMATCH')
    }

    // Calculate discount
    let discount = 0
    if (promo.discount_type === 'flat') {
      discount = promo.discount_value
    } else {
      discount = Math.round(amount * promo.discount_value / 100)
      if (promo.max_discount) discount = Math.min(discount, promo.max_discount)
    }
    discount = Math.min(discount, amount)

    res.json({
      success: true,
      data: {
        code: promo.code,
        description: promo.description,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        discount_amount: discount,
        final_amount: amount - discount,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /promo/available — Active promos for an event ────────
router.get('/available', async (req, res, next) => {
  try {
    const eventId = req.query.event_id as string

    let query = supabase
      .from('promo_codes')
      .select('code, description, discount_type, discount_value, min_order, max_discount, valid_until')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())

    if (eventId) {
      query = query.or(`event_id.is.null,event_id.eq.${eventId}`)
    } else {
      query = query.is('event_id', null)
    }

    const { data, error } = await query
    if (error) throw new AppError(500, 'Failed to fetch promos', 'DB_ERROR')

    res.json({ success: true, data: data || [] })
  } catch (err) {
    next(err)
  }
})

export { router as promoRouter }
