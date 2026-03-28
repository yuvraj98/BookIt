import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { supabase } from '../lib/supabase'
import { validate } from '../middleware/validate'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { AppError } from '../middleware/errorHandler'
import { logger } from '../lib/logger'

const router = Router()

// ─── OTP rate limiter (strict — 3 per phone per 10 min) ──────
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body?.phone || req.ip || 'unknown',
  message: { success: false, error: 'Too many OTP requests. Try again in 10 minutes.' },
})

// ─── Schemas ──────────────────────────────────────────────────
const sendOtpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+91[6-9]\d{9}$/, 'Invalid Indian mobile number. Format: +91XXXXXXXXXX'),
})

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/),
})

const refreshSchema = z.object({
  refresh_token: z.string().min(1),
})

// ─── Helpers ─────────────────────────────────────────────────
function generateTokens(userId: string, phone: string, role: string) {
  const accessToken = jwt.sign(
    { id: userId, phone, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as any }
  )
  const refreshToken = jwt.sign(
    { id: userId, phone, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '30d') as any }
  )
  return { accessToken, refreshToken }
}

// ─── POST /auth/otp/send ──────────────────────────────────────
router.post('/otp/send', otpLimiter, validate(sendOtpSchema), async (req, res, next) => {
  try {
    const { phone } = req.body

    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: 'sms' },
    })

    if (error) {
      logger.error('OTP send error:', error)
      throw new AppError(500, 'Failed to send OTP. Please try again.', 'OTP_SEND_FAILED')
    }

    res.json({ success: true, message: 'OTP sent successfully', expires_in: 600 })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/otp/verify ────────────────────────────────────
router.post('/otp/verify', validate(verifyOtpSchema), async (req, res, next) => {
  try {
    const { phone, otp } = req.body

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    if (error || !data.user) {
      throw new AppError(401, 'Invalid or expired OTP', 'OTP_INVALID')
    }

    // Upsert user in our users table
    const { data: userRow, error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: data.user.id,
          phone,
          role: 'customer',
          loyalty_coins: 0,
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )
      .select()
      .single()

    if (upsertError) {
      logger.error('User upsert error:', upsertError)
      throw new AppError(500, 'Failed to create user profile', 'USER_CREATE_FAILED')
    }

    const { accessToken, refreshToken } = generateTokens(
      userRow.id,
      userRow.phone,
      userRow.role
    )

    res.json({
      success: true,
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userRow,
      },
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/refresh ────────────────────────────────────────
router.post('/refresh', validate(refreshSchema), async (req, res, next) => {
  try {
    const { refresh_token } = req.body
    const payload = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET!) as {
      id: string
      phone: string
      role: 'customer' | 'organiser' | 'admin'
    }

    const { accessToken, refreshToken } = generateTokens(payload.id, payload.phone, payload.role)
    res.json({ success: true, data: { access_token: accessToken, refresh_token: refreshToken } })
  } catch (err) {
    next(err)
  }
})

// ─── GET /auth/me ─────────────────────────────────────────────
router.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user!.id)
      .single()

    if (error || !data) throw new AppError(404, 'User not found', 'USER_NOT_FOUND')

    res.json({ success: true, data })
  } catch (err) {
    next(err)
  }
})

// ─── PUT /auth/me — Update profile ────────────────────────────
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().max(255).optional(),
})

router.put('/me', authenticate, validate(updateProfileSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, email } = req.body
    
    const { data, error } = await supabase
      .from('users')
      .update({ name, email })
      .eq('id', req.user!.id)
      .select()
      .single()

    if (error) throw new AppError(500, 'Failed to update profile', 'DB_ERROR')

    res.json({
      success: true,
      data,
      message: 'Profile updated successfully',
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/logout ────────────────────────────────────────
router.post('/logout', authenticate, async (_req, res) => {
  // Client should delete tokens — server stateless with JWT
  res.json({ success: true, message: 'Logged out successfully' })
})

export { router as authRouter }
