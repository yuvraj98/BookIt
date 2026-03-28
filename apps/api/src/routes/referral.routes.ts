import { Router } from 'express'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()
router.use(authenticate)

// ─── GET /referrals/my-code — Get or generate referral code ──
router.get('/my-code', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('referral_code, name')
      .eq('id', req.user!.id)
      .single()

    let code = user?.referral_code
    if (!code) {
      code = `BK${req.user!.id.slice(0, 6).toUpperCase()}`
      await supabase.from('users').update({ referral_code: code }).eq('id', req.user!.id)
    }

    const { count } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', req.user!.id)
      .eq('status', 'completed')

    res.json({
      success: true,
      data: {
        code,
        total_referrals: count || 0,
        coins_per_referral: 50,
        share_message: `Join BookIt and get ₹50 off on your first booking! Use my code ${code}. Download now: https://bookit.in/r/${code}`,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /referrals/apply — Apply a referral code ───────────
const applySchema = z.object({
  code: z.string().min(2).max(20),
})

router.post('/apply', validate(applySchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code } = req.body

    // Find referrer
    const { data: referrer } = await supabase
      .from('users')
      .select('id, name')
      .eq('referral_code', code)
      .single()

    if (!referrer) throw new AppError(404, 'Invalid referral code', 'INVALID_CODE')
    if (referrer.id === req.user!.id) throw new AppError(400, 'Cannot refer yourself', 'SELF_REFERRAL')

    // Check if already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', req.user!.id)
      .single()

    if (existing) throw new AppError(409, 'You have already used a referral code', 'ALREADY_REFERRED')

    // Create referral
    await supabase.from('referrals').insert({
      referrer_id: referrer.id,
      referred_id: req.user!.id,
      referral_code: code,
      coins_awarded: 50,
      status: 'completed',
    })

    // Award coins to both
    await supabase.rpc('increment_loyalty_coins', { p_user_id: referrer.id, p_coins: 50 })
    await supabase.rpc('increment_loyalty_coins', { p_user_id: req.user!.id, p_coins: 25 })

    logger.info(`Referral: ${req.user!.id} used code ${code} from ${referrer.id}`)

    res.json({
      success: true,
      message: `Referral applied! You got 25 coins, ${referrer.name || 'your friend'} got 50 coins! 🎉`,
    })
  } catch (err) {
    next(err)
  }
})

// ─── GET /referrals/history — Referral history ────────────────
router.get('/history', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, referred:referred_id(name, phone)')
      .eq('referrer_id', req.user!.id)
      .order('created_at', { ascending: false })

    if (error) throw new AppError(500, 'Failed to fetch referrals', 'DB_ERROR')
    res.json({ success: true, data: data || [] })
  } catch (err) {
    next(err)
  }
})

export { router as referralRouter }
