'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import toast from 'react-hot-toast'
import {
  IndianRupee,
  Smartphone,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Clock,
  Loader2,
  Sparkles,
  CreditCard,
  QrCode,
  Building2,
} from 'lucide-react'
import Link from 'next/link'

type PaymentStep = 'details' | 'processing' | 'success' | 'failed'

interface BookingDetail {
  id: string
  event_id: string
  total_amount: number
  amount: number
  convenience_fee: number
  status: string
  qr_token: string
  expires_at: string
  seat_ids: string[]
  events: {
    title: string
    venue_name: string
    venue_address: string
    city: string
    starts_at: string
    poster_url: string | null
    organisers: { business_name: string }
  }
  seats: { id: string; label: string; seat_sections: { label: string; price: number } }[]
}

export function PaymentSimulator({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore()
  const [step, setStep] = useState<PaymentStep>('details')
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi')
  const [upiId, setUpiId] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch booking details
  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data } = await api.get<{ data: BookingDetail }>(`/bookings/${bookingId}`)
      return data.data
    },
    enabled: isAuthenticated,
  })

  // Timer for expires_at
  useEffect(() => {
    if (!booking?.expires_at) return
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.floor((new Date(booking.expires_at).getTime() - Date.now()) / 1000))
      setCountdown(remaining)
      if (remaining === 0) {
        setStep('failed')
      }
    }
    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [booking?.expires_at])

  // Simulate payment confirmation
  const confirmMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/bookings/${bookingId}/confirm`, {
        razorpay_payment_id: `pay_sim_${Date.now()}`,
        razorpay_order_id: `order_sim_${Date.now()}`,
        razorpay_signature: `sig_sim_${Date.now()}`,
      })
      return res.data
    },
    onSuccess: (data) => {
      setStep('success')
      queryClient.invalidateQueries({ queryKey: ['myBookings'] })
      toast.success(data.message || 'Payment successful!')
    },
    onError: (err: any) => {
      setStep('failed')
      toast.error(err.response?.data?.error || 'Payment failed')
    },
  })

  const handlePay = () => {
    if (selectedMethod === 'upi' && !upiId.includes('@')) {
      toast.error('Enter a valid UPI ID (e.g., name@upi)')
      return
    }
    setStep('processing')
    // Simulate processing delay
    setTimeout(() => {
      confirmMutation.mutate()
    }, 2500)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  if (isLoading || authLoading) {
    return (
      <div className="max-w-lg mx-auto animate-pulse space-y-6">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="card skeleton h-64 rounded-2xl" />
        <div className="card skeleton h-48 rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <h2 className="text-2xl font-display font-bold mb-4">Booking not found</h2>
        <p className="text-text-muted mb-8">This booking might have expired or doesn't exist.</p>
        <Link href="/profile/bookings" className="btn-primary">View My Bookings</Link>
      </div>
    )
  }

  if (booking.status === 'confirmed') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-in fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          <CheckCircle2 size={40} className="text-emerald-400" />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3">Already Confirmed</h2>
        <p className="text-text-muted mb-8">This booking has already been paid and confirmed.</p>
        <Link href="/profile/bookings" className="btn-primary">View My Tickets</Link>
      </div>
    )
  }

  if (booking.status === 'cancelled') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 animate-in fade-in">
        <h2 className="text-3xl font-display font-bold mb-3 text-red-400">Booking Cancelled</h2>
        <p className="text-text-muted mb-8">This booking has been cancelled.</p>
        <Link href="/events" className="btn-primary">Browse Events</Link>
      </div>
    )
  }

  const eventDate = new Date(booking.events.starts_at)

  return (
    <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">

      {/* ─── Header ────────────────────────────────────── */}
      {step !== 'success' && step !== 'failed' && (
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="btn-ghost text-sm">
            <ArrowLeft size={16} />
            Back
          </button>
          {countdown !== null && countdown > 0 && (
            <div className={`flex items-center gap-2 text-sm font-mono font-bold px-3 py-1.5 rounded-lg border ${
              countdown < 120
                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                : 'bg-surface-800 text-text-muted border-white/10'
            }`}>
              <Clock size={14} />
              {formatTime(countdown)}
            </div>
          )}
        </div>
      )}

      {/* ─── Step: Payment Details ─────────────────────── */}
      {step === 'details' && (
        <div className="space-y-6">

          {/* Order Summary */}
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <CreditCard size={20} className="text-brand-500" />
              Order Summary
            </h2>
            <div className="border-b border-white/[0.06] pb-4">
              <h3 className="font-bold text-lg text-white">{booking.events.title}</h3>
              <p className="text-text-muted text-sm mt-1">
                {eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} • {booking.events.venue_name}
              </p>
            </div>

            {booking.seats && booking.seats.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs text-text-subtle uppercase tracking-wider font-bold">Selected Seats</h4>
                <div className="flex flex-wrap gap-2">
                  {booking.seats.map((seat) => (
                    <span key={seat.id} className="badge bg-surface-700 text-white border border-white/10 text-sm">
                      {seat.label}
                      <span className="text-text-muted ml-1 text-xs">
                        ({seat.seat_sections?.label})
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user && user.loyalty_coins > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Loyalty Coins</p>
                    <p className="text-[10px] text-amber-400/70">Available for future redemption</p>
                  </div>
                </div>
                <span className="text-lg font-display font-bold text-amber-400">{user.loyalty_coins}</span>
              </div>
            )}

            <div className="divider" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Tickets ({booking.seat_ids?.length || 0}x)</span>
                <span className="flex items-center"><IndianRupee size={12} className="mr-0.5" />{booking.amount}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Convenience Fee</span>
                <span className="flex items-center"><IndianRupee size={12} className="mr-0.5" />{booking.convenience_fee}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between font-bold text-lg text-white pt-1">
                <span>Total</span>
                <span className="flex items-center text-brand-400 font-display">
                  <IndianRupee size={18} className="mr-0.5" />
                  {booking.total_amount}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6 space-y-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Smartphone size={20} className="text-blue-400" />
              Payment Method
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {([
                { key: 'upi', label: 'UPI', icon: <QrCode size={20} /> },
                { key: 'card', label: 'Card', icon: <CreditCard size={20} /> },
                { key: 'netbanking', label: 'Net Banking', icon: <Building2 size={20} /> },
              ] as const).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setSelectedMethod(key)}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                    selectedMethod === key
                      ? 'border-brand-500/60 bg-brand-500/10 text-white shadow-glow'
                      : 'border-white/10 bg-surface-800 text-text-muted hover:border-white/20'
                  }`}
                >
                  {icon}
                  <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                </button>
              ))}
            </div>

            {selectedMethod === 'upi' && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="text-sm text-text-muted block mb-2">UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="input"
                />
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
                <div>
                  <label className="text-sm text-text-muted block mb-2">Card Number</label>
                  <input type="text" placeholder="4242 4242 4242 4242" className="input" readOnly />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-text-muted block mb-2">Expiry</label>
                    <input type="text" placeholder="12/28" className="input" readOnly />
                  </div>
                  <div>
                    <label className="text-sm text-text-muted block mb-2">CVC</label>
                    <input type="text" placeholder="123" className="input" readOnly />
                  </div>
                </div>
                <p className="text-xs text-text-subtle flex items-center gap-1.5">
                  <Shield size={12} className="text-emerald-400" />
                  Simulated payment — no real charges
                </p>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="animate-in fade-in slide-in-from-bottom-2">
                <label className="text-sm text-text-muted block mb-2">Select Bank</label>
                <select className="input appearance-none cursor-pointer">
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
          </div>

          {/* Pay Button */}
          <button onClick={handlePay} className="btn-primary w-full justify-center text-lg py-4 shadow-glow group">
            <Shield size={20} className="group-hover:scale-110 transition-transform" />
            Pay <IndianRupee size={18} className="mx-0.5" />{booking.total_amount}
          </button>

          <p className="text-xs text-text-subtle text-center flex items-center justify-center gap-1.5">
            <Shield size={12} className="text-emerald-400" />
            Secured by Razorpay (Simulated) — 256-bit SSL encryption
          </p>
        </div>
      )}

      {/* ─── Step: Processing ──────────────────────────── */}
      {step === 'processing' && (
        <div className="card p-12 text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-brand-500/20 flex items-center justify-center">
            <Loader2 size={36} className="text-brand-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">Processing Payment</h2>
            <p className="text-text-muted">Please wait while we confirm your payment...</p>
          </div>
          <div className="w-full h-2 bg-surface-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full animate-[progress_2.5s_ease-in-out]" 
              style={{ animation: 'progress 2.5s ease-in-out forwards' }}
            />
          </div>
          <p className="text-xs text-text-subtle">Do not close this page</p>
        </div>
      )}

      {/* ─── Step: Success ─────────────────────────────── */}
      {step === 'success' && (
        <div className="text-center space-y-8 animate-in fade-in zoom-in py-8">
          <div className="relative">
            <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.4)]">
              <CheckCircle2 size={48} className="text-emerald-400" />
            </div>
            <Sparkles size={20} className="text-amber-400 absolute top-0 right-1/3 animate-bounce" />
            <Sparkles size={14} className="text-brand-400 absolute bottom-2 left-1/3 animate-bounce delay-300" />
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-text-muted max-w-sm mx-auto">
              Your tickets for <span className="text-white font-semibold">{booking.events.title}</span> have been booked successfully.
            </p>
          </div>

          <div className="card p-6 text-left max-w-sm mx-auto space-y-4 bg-surface-800/60">
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Amount Paid</span>
              <span className="font-bold text-white flex items-center gap-0.5"><IndianRupee size={14} />{booking.total_amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Booking ID</span>
              <span className="font-mono text-xs text-text-subtle bg-surface-700 px-2 py-1 rounded">{booking.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Seats</span>
              <span className="text-white font-medium">{booking.seat_ids?.length || 0} ticket(s)</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Link href="/profile/bookings" className="btn-primary shadow-glow">
              View My Tickets
            </Link>
            <Link href="/events" className="btn-secondary">
              Browse More
            </Link>
          </div>
        </div>
      )}

      {/* ─── Step: Failed ──────────────────────────────── */}
      {step === 'failed' && (
        <div className="card p-12 text-center space-y-6 animate-in fade-in">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <Clock size={36} className="text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold mb-2 text-red-400">Payment Failed</h2>
            <p className="text-text-muted">
              {countdown === 0
                ? 'Your booking has expired. Seats have been released.'
                : 'Something went wrong during payment. Please try again.'}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/events" className="btn-primary">
              Browse Events
            </Link>
            <Link href="/profile/bookings" className="btn-secondary">
              My Bookings
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
