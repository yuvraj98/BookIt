'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Ticket, Phone, ArrowRight, ChevronLeft, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

// ─── Schemas ────────────────────────────────────────────────
const phoneSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'Enter the 6-digit OTP'),
})

type PhoneForm = z.infer<typeof phoneSchema>
type OtpForm  = z.infer<typeof otpSchema>

// ─── Component ──────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter()
  const { setUser } = useAuthStore()
  const [step, setStep]         = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) })
  const otpForm   = useForm<OtpForm>({  resolver: zodResolver(otpSchema) })

  // Start resend countdown
  const startTimer = () => {
    setResendTimer(30)
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0 }
        return t - 1
      })
    }, 1000)
  }

  // Step 1: Send OTP (or dev-login in development)
  const onSendOtp = async ({ phone: p }: PhoneForm) => {
    setLoading(true)
    try {
      const fullPhone = `+91${p}`

      // In development, bypass OTP and login directly
      if (process.env.NODE_ENV === 'development') {
        const { data } = await api.post('/auth/dev-login', { phone: fullPhone })
        setUser(data.data.user, data.data.access_token, data.data.refresh_token)
        toast.success(`Welcome, ${data.data.user.name || 'User'}! 🎉 (Dev login)`)
        router.push('/')
        return
      }

      await api.post('/auth/otp/send', { phone: fullPhone })
      setPhone(fullPhone)
      setStep('otp')
      startTimer()
      toast.success('OTP sent to your WhatsApp and SMS')
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const onVerifyOtp = async ({ otp }: OtpForm) => {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/otp/verify', { phone, otp })
      setUser(data.data.user, data.data.access_token, data.data.refresh_token)
      toast.success('Welcome to BookIt! 🎉')
      router.push('/')
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Card */}
      <div className="card-glass border border-white/10 rounded-3xl p-8 sm:p-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow">
            <Ticket className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold">BookIt</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── Step 1: Phone ─────────────────────────────── */}
          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-2xl font-bold text-white mb-1">Sign in to BookIt</h1>
              <p className="text-[#a0a0a0] text-sm mb-8">
                Enter your mobile number to receive a one-time password.
              </p>

              <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#a0a0a0] mb-2">
                    Mobile Number
                  </label>
                  <div className="relative flex">
                    <div className="flex items-center px-4 border border-r-0 border-white/10 bg-surface-700 rounded-l-xl text-sm text-[#606060] font-medium rounded-r-none">
                      <span className="mr-1">🇮🇳</span> +91
                    </div>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={10}
                      {...phoneForm.register('phone')}
                      className="input rounded-l-none flex-1 border-l-0"
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-xs text-brand-400 mt-1.5">
                      {phoneForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <>
                      Send OTP
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex items-center gap-2 text-xs text-[#606060]">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                Your number is never shared with anyone
              </div>
            </motion.div>
          )}

          {/* ─── Step 2: OTP ───────────────────────────────── */}
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setStep('phone')}
                className="flex items-center gap-1.5 text-sm text-[#606060] hover:text-white mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Change number
              </button>

              <h2 className="text-2xl font-bold text-white mb-1">Enter OTP</h2>
              <p className="text-[#a0a0a0] text-sm mb-2">
                We sent a 6-digit code to
              </p>
              <p className="text-brand-400 font-semibold text-sm mb-8">{phone}</p>

              <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    maxLength={6}
                    {...otpForm.register('otp')}
                    className="input text-center text-2xl tracking-[1rem] py-4 font-bold"
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="text-xs text-brand-400 mt-1.5">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <>Verify & Sign In</>
                  )}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-[#606060]">Resend OTP in {resendTimer}s</p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSendOtp({ phone: phone.slice(3) })}
                      className="text-sm text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="divider my-6" />

        <p className="text-xs text-[#606060] text-center">
          By continuing, you agree to our{' '}
          <Link href="/terms" className="text-[#a0a0a0] hover:text-white underline">Terms</Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-[#a0a0a0] hover:text-white underline">Privacy Policy</Link>
        </p>
      </div>
    </motion.div>
  )
}
