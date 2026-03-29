import { Router } from 'express'
import { supabase } from '../lib/supabase'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'

const router = Router()

// All notifications routes require authentication
router.use(authenticate)

// ─── GET /notifications — Get user's notifications ──────────
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('sent_at', { ascending: false })
      .limit(20)

    if (error) throw new AppError(500, 'Failed to fetch notifications', 'NOTIFICATIONS_FETCH_FAILED')

    res.json({ success: true, data: data || [] })
  } catch (err) {
    next(err)
  }
})

// ─── POST /notifications — Insert welcome notification ──────
router.post('/welcome', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', req.user!.id)
      .eq('type', 'welcome')

    if (existing && existing.length > 0) return res.json({ success: true })

    await supabase.from('notifications').insert({
      user_id: req.user!.id,
      type: 'welcome',
      channel: 'push',
      payload: {
        title: 'Welcome to BookIt! 🎉',
        message: 'Your account is ready. Start exploring amazing events in your city.'
      }
    })

    res.json({ success: true })
  } catch (err) {
    next(err)
  }
})

export { router as notificationsRouter }
