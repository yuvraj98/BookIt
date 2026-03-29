'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import {
  Film, Clock, MapPin, Tv2, CreditCard, QrCode, Building2,
  Smartphone, CheckCircle2, XCircle, IndianRupee, Loader2,
  Ticket, ChevronLeft, Star, Tag,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

type PaymentStep = 'details' | 'processing' | 'success' | 'failed'

export function MoviePaymentPage({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const [step, setStep] = useState<PaymentStep>('details')
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [countdown, setCountdown] = useState<number | null>(null)
  const qrRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login')
  }, [authLoading, isAuthenticated, router])

  const { data: booking, isLoading } = useQuery({
    queryKey: ['movie-booking', bookingId],
    queryFn: async () => {
      const res = await api.get<{ data: any }>(`/shows/bookings/${bookingId}`)
      return res.data.data
    },
    enabled: isAuthenticated,
  })

  // Countdown timer
  useEffect(() => {
    if (!booking?.expires_at) return
    const update = () => {
      const remaining = Math.max(0, Math.floor((new Date(booking.expires_at).getTime() - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) setStep('failed')
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [booking?.expires_at])

  // Generate QR on success
  useEffect(() => {
    if (step === 'success' && booking && qrRef.current) {
      QRCode.toCanvas(qrRef.current, `BOOKIT-MOVIE:${booking.qr_token}:${bookingId}`, {
        width: 200,
        margin: 1,
        color: { dark: '#ffffff', light: '#00000000' },
      }).catch(console.error)
    }
  }, [step, booking, bookingId])

  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/shows/book/${bookingId}/confirm`, {
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`,
      })
      return res.data
    },
    onSuccess: () => {
      setStep('success')
      queryClient.invalidateQueries({ queryKey: ['movie-booking', bookingId] })
      toast.success('Movie booking confirmed! Enjoy the show! 🎬')
    },
    onError: (err: any) => {
      setStep('failed')
      toast.error(err.response?.data?.error || 'Payment failed')
    },
  })

  if (isLoading) {
    return (
      <div className="section py-16 animate-pulse space-y-6">
        <div className="h-8 skeleton w-64 rounded" />
        <div className="card h-64 skeleton" />
        <div className="card h-48 skeleton" />
      </div>
    )
  }

  if (!booking) return null

  const show = booking.shows
  const movie = show?.movies
  const screen = show?.screens
  const theatre = screen?.theatres
  const seatDetails = booking.seat_details || []

  const formatTime = (t: string | null) => {
    if (!countdown || countdown <= 0) return '00:00'
    const m = Math.floor(countdown / 60).toString().padStart(2, '0')
    const s = (countdown % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ─── Success Screen ───────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="section py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          {/* Ticket */}
          <div className="relative">
            {/* Card */}
            <div className="bg-gradient-to-br from-[#1a0a2e] to-[#0d1a2e] rounded-3xl overflow-hidden border border-purple-500/30 shadow-[0_0_80px_rgba(139,92,246,0.3)]">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-purple-200 text-xs uppercase tracking-widest font-bold">BookIt Cinema Pass</span>
                  <CheckCircle2 size={20} className="text-green-300" />
                </div>
                <h2 className="text-white font-display font-bold text-2xl">{movie?.title}</h2>
              </div>

              {/* Movie poster strip */}
              {movie?.poster_url && (
                <div className="relative h-48 overflow-hidden">
                  <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover opacity-40 blur-sm scale-110" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl font-display font-black text-white/90">
                        {show?.show_time?.slice(0, 5)}
                      </div>
                      <div className="text-purple-300 text-sm mt-1">
                        {show?.show_date && new Date(`${show.show_date}T00:00:00`).toLocaleDateString('en-IN', {
                          weekday: 'long', day: 'numeric', month: 'long'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tear line */}
              <div className="flex items-center">
                <div className="w-5 h-5 bg-surface-900 rounded-full -ml-2.5" />
                <div className="flex-1 border-t-2 border-dashed border-purple-500/20 mx-2" />
                <div className="w-5 h-5 bg-surface-900 rounded-full -mr-2.5" />
              </div>

              {/* Details */}
              <div className="px-6 py-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-purple-400/70 text-[10px] uppercase tracking-wider font-bold mb-1">Theatre</p>
                  <p className="text-white font-medium text-xs">{theatre?.name}</p>
                </div>
                <div>
                  <p className="text-purple-400/70 text-[10px] uppercase tracking-wider font-bold mb-1">Screen</p>
                  <p className="text-white font-medium">Screen {screen?.screen_number} · {screen?.screen_type}</p>
                </div>
                <div>
                  <p className="text-purple-400/70 text-[10px] uppercase tracking-wider font-bold mb-1">Seats</p>
                  <div className="flex flex-wrap gap-1">
                    {seatDetails.map((s: any) => (
                      <span key={s.id} className="text-[11px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold">
                        {s.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-purple-400/70 text-[10px] uppercase tracking-wider font-bold mb-1">Format</p>
                  <p className="text-white font-medium">{show?.language}</p>
                </div>
              </div>

              {/* Tear line 2 */}
              <div className="flex items-center">
                <div className="w-5 h-5 bg-surface-900 rounded-full -ml-2.5" />
                <div className="flex-1 border-t-2 border-dashed border-purple-500/20 mx-2" />
                <div className="w-5 h-5 bg-surface-900 rounded-full -mr-2.5" />
              </div>

              {/* QR Code */}
              <div className="px-6 py-6 flex items-center gap-6">
                <div className="bg-white/5 border border-purple-500/20 p-3 rounded-2xl">
                  <canvas ref={qrRef} className="block" />
                </div>
                <div>
                  <p className="text-text-subtle text-[10px] uppercase tracking-widest mb-1">Booking ID</p>
                  <p className="text-white font-mono text-xs font-bold">{bookingId.slice(0, 8).toUpperCase()}</p>
                  <p className="text-text-subtle text-[10px] mt-3 uppercase tracking-widest mb-1">Total Paid</p>
                  <p className="text-purple-300 font-display font-bold text-xl">₹{booking.total_amount}</p>
                  {user && (
                    <p className="text-amber-400 text-[10px] mt-1">
                      +{Math.floor(booking.total_amount / 100)} coins earned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/movies" className="btn-ghost flex-1 justify-center">
              More Movies
            </Link>
            <Link href="/profile/bookings" className="btn-secondary flex-1 justify-center">
              My Bookings
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Failed Screen ────────────────────────────────────────
  if (step === 'failed') {
    return (
      <div className="section py-20 text-center">
        <XCircle size={64} className="mx-auto text-red-400 mb-4" />
        <h1 className="text-2xl font-display font-bold text-white mb-2">Payment Failed</h1>
        <p className="text-text-muted mb-8">
          {countdown === 0 ? 'Your booking session expired.' : 'Something went wrong with your payment.'}
        </p>
        <Link href={`/movies/${movie?.id}`} className="btn-primary">
          Try Again
        </Link>
      </div>
    )
  }

  // ─── Details / Processing Screen ─────────────────────────
  return (
    <div className="section py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={`/movies/shows/${show?.id || ''}`} className="text-text-muted hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">Complete Booking</h1>
            {countdown !== null && (
              <div className={`flex items-center gap-1.5 text-sm font-bold ${countdown < 120 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
                <Clock size={14} />
                Expires in {formatTime(null)} · Complete payment before time runs out
              </div>
            )}
          </div>
        </div>

        {/* Booking Summary */}
        <div className="card p-6 space-y-5">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Film size={20} className="text-purple-400" />
            Booking Summary
          </h2>

          {/* Movie info */}
          <div className="flex gap-4 items-start p-4 bg-surface-800 rounded-xl">
            {movie?.poster_url && (
              <img src={movie.poster_url} alt={movie.title} className="w-16 h-24 object-cover rounded-lg shrink-0 border border-white/10" />
            )}
            <div>
              <h3 className="font-bold text-white text-lg">{movie?.title}</h3>
              <div className="text-sm text-text-muted space-y-1 mt-1">
                <p className="flex items-center gap-1.5"><Tv2 size={13} /> {theatre?.name}</p>
                <p className="flex items-center gap-1.5"><MapPin size={13} /> {theatre?.address}</p>
                <p className="flex items-center gap-1.5"><Clock size={13} />
                  {show?.show_date && new Date(`${show.show_date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} at {show?.show_time?.slice(0, 5)}
                </p>
                <p className="text-xs">
                  <span className="bg-surface-700 px-2 py-0.5 rounded uppercase font-bold text-text-muted">{screen?.screen_type}</span>
                  <span className="ml-2">{show?.language}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          {seatDetails.length > 0 && (
            <div>
              <p className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Selected Seats</p>
              <div className="flex flex-wrap gap-2">
                {seatDetails.map((seat: any) => (
                  <span
                    key={seat.id}
                    className="text-sm px-2.5 py-1.5 rounded-lg bg-surface-700 border border-white/10 text-white font-medium flex items-center gap-1.5"
                  >
                    <Ticket size={13} className="text-purple-400" />
                    {seat.label}
                    <span className="text-text-muted text-xs">({seat.category})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price breakdown */}
          <div className="space-y-2 text-sm pt-2 border-t border-white/5">
            {seatDetails.map((s: any) => (
              <div key={s.id} className="flex justify-between text-text-muted">
                <span>{s.label} ({s.category})</span>
                <span>₹{s.price}</span>
              </div>
            ))}
            <div className="flex justify-between text-text-muted">
              <span>Convenience Fee (3%)</span>
              <span>₹{booking.convenience_fee}</span>
            </div>
            <div className="divider" />
            <div className="flex justify-between font-bold text-lg text-white pt-1">
              <span>Total</span>
              <span className="text-purple-400 font-display">₹{booking.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <Smartphone size={20} className="text-blue-400" />
            Payment Method
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'upi',        label: 'UPI',         icon: <QrCode size={20} /> },
              { key: 'card',       label: 'Card',        icon: <CreditCard size={20} /> },
              { key: 'netbanking', label: 'Net Banking',  icon: <Building2 size={20} /> },
            ] as const).map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setSelectedMethod(key)}
                className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                  selectedMethod === key
                    ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                    : 'border-white/10 bg-surface-800 text-text-muted hover:border-white/20'
                }`}
              >
                {icon}
                <span className="text-xs font-bold">{label}</span>
              </button>
            ))}
          </div>

          {selectedMethod === 'upi' && (
            <div>
              <label className="text-sm text-text-muted block mb-2">UPI ID</label>
              <input type="text" placeholder="yourname@upi" className="input" defaultValue="demo@bookit" />
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-400">
            <Star size={14} />
            This is a simulation. No real payment will be processed.
          </div>

          <AnimatePresence>
            {step === 'processing' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 py-4"
              >
                <Loader2 size={24} className="text-purple-400 animate-spin" />
                <span className="text-purple-400 font-bold">Processing payment...</span>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => {
                  setStep('processing')
                  setTimeout(() => confirmMutation.mutate(), 1500)
                }}
                className="w-full font-bold text-base py-4 rounded-xl text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)', boxShadow: '0 0 30px rgba(139,92,246,0.3)' }}
              >
                Pay ₹{booking.total_amount} · Confirm Booking
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
