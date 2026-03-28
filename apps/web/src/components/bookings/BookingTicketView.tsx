'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  QrCode,
  Calendar,
  MapPin,
  IndianRupee,
  Download,
  ChevronLeft,
  CheckCircle2,
  Shield,
  Clock as ClockIcon,
  Ticket,
} from 'lucide-react'

interface BookingDetail {
  id: string
  event_id: string
  total_amount: number
  amount: number
  convenience_fee: number
  status: string
  qr_token: string | null
  confirmed_at: string | null
  created_at: string
  seat_ids: string[]
  events: {
    title: string
    venue_name: string
    venue_address: string
    city: string
    starts_at: string
    ends_at: string
    poster_url: string | null
    organisers: { business_name: string }
  }
  seats: { id: string; label: string; seat_sections: { label: string; price: number } }[]
}

export function BookingTicketView({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const { data } = await api.get<{ data: BookingDetail }>(`/bookings/${bookingId}`)
      return data.data
    },
    enabled: isAuthenticated,
  })

  if (isLoading || authLoading) {
    return (
      <div className="max-w-md mx-auto animate-pulse space-y-6 py-8">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className="card skeleton h-[500px] rounded-2xl" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h2 className="text-2xl font-display font-bold mb-4">Booking not found</h2>
        <Link href="/profile/bookings" className="btn-primary">View My Bookings</Link>
      </div>
    )
  }

  const eventDate = new Date(booking.events.starts_at)
  const isPast = eventDate < new Date()
  const isConfirmed = booking.status === 'confirmed'

  return (
    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4">
      <button onClick={() => router.back()} className="btn-ghost text-sm mb-6">
        <ChevronLeft size={16} />
        Back
      </button>

      {/* ─── Ticket Card ────────────────────────────────── */}
      <div className="relative">
        {/* Ticket notch cutouts */}
        <div className="absolute left-[-12px] top-[60%] w-6 h-6 rounded-full bg-surface-900 z-10" />
        <div className="absolute right-[-12px] top-[60%] w-6 h-6 rounded-full bg-surface-900 z-10" />

        <div className="card overflow-hidden border-white/[0.08] relative">
          {/* Status bar */}
          <div className={`h-1.5 w-full ${
            isConfirmed ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 
            booking.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
            'bg-gradient-to-r from-red-500 to-red-400'
          }`} />

          {/* Top section: Event Info */}
          <div className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`badge border text-xs font-bold uppercase tracking-wider ${
                  isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {isConfirmed ? (
                    <><CheckCircle2 size={12} className="mr-1" /> Confirmed</>
                  ) : (
                    booking.status
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-subtle">
                <Shield size={12} className="text-emerald-400" />
                Verified
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white leading-tight">
              {booking.events.title}
            </h2>

            <div className="space-y-2.5 text-sm">
              <div className="flex items-center gap-3 text-text-muted">
                <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-white font-medium">
                    {eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <p className="text-xs">{eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-text-muted">
                <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium">{booking.events.venue_name}</p>
                  <p className="text-xs">{booking.events.city}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perforation line */}
          <div className="relative">
            <div className="border-t-2 border-dashed border-white/10 mx-6" />
          </div>

          {/* Bottom section: Ticket Details */}
          <div className="p-6 space-y-4">
            {/* Seats */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Seats</h4>
                <div className="flex flex-wrap gap-1.5">
                  {booking.seats?.map((seat) => (
                    <span key={seat.id} className="bg-surface-700 text-white px-2 py-1 rounded text-xs font-bold border border-white/10">
                      {seat.label}
                    </span>
                  )) || (
                    <span className="text-text-muted text-sm">{booking.seat_ids?.length || 0} ticket(s)</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-xs text-text-subtle uppercase tracking-wider font-bold mb-2">Total Paid</h4>
                <p className="text-2xl font-display font-bold text-white flex items-center justify-end">
                  <IndianRupee size={18} className="mr-0.5 text-text-muted" />
                  {booking.total_amount}
                </p>
              </div>
            </div>

            {/* QR Code (Simulated) */}
            {isConfirmed && !isPast && booking.qr_token && (
              <div className="bg-white p-6 rounded-2xl text-center space-y-3 mt-4">
                <div className="w-40 h-40 mx-auto bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:20px_20px] rounded-lg relative flex items-center justify-center">
                  {/* Simulated QR grid pattern */}
                  <div className="absolute inset-2 bg-white rounded flex items-center justify-center">
                    <div className="grid grid-cols-8 gap-[2px] w-full h-full p-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`rounded-[1px] ${
                            Math.random() > 0.4 ? 'bg-black' : 'bg-white'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                    <Ticket size={24} className="text-brand-500" />
                  </div>
                </div>
                <p className="text-black text-xs font-mono font-bold tracking-wider">
                  {booking.qr_token.slice(0, 8).toUpperCase()}
                </p>
                <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  Show this at entry
                </p>
              </div>
            )}

            {/* Booking Meta */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-surface-800/50 rounded-xl p-4 border border-white/5">
              <div>
                <span className="text-text-subtle block mb-1">Booking ID</span>
                <span className="text-white font-mono">{booking.id.slice(0, 8)}</span>
              </div>
              <div className="text-right">
                <span className="text-text-subtle block mb-1">Booked On</span>
                <span className="text-white">{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            {booking.status === 'pending' && (
              <Link 
                href={`/profile/bookings/${bookingId}/pay`} 
                className="btn-primary w-full justify-center shadow-glow animate-pulse"
              >
                Complete Payment
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
