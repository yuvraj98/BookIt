'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, IndianRupee, QrCode, LogOut, Ticket, CircleUserRound } from 'lucide-react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
  created_at: string
  qr_token: string | null
  events: {
    title: string
    venue_name: string
    city: string
    starts_at: string
    poster_url: string | null
  }
}

export function UserBookings() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuthStore()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: Booking[] } }>('/bookings/mine')
      return data.data.items
    },
    enabled: isAuthenticated,
  })

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    router.push('/')
  }

  if (authLoading || isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
          <div className="w-16 h-16 rounded-full skeleton" />
          <div className="space-y-2">
            <div className="w-32 h-6 skeleton rounded" />
            <div className="w-24 h-4 skeleton rounded" />
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 skeleton rounded-2xl" />
        ))}
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4">
      {/* ─── Profile Header ───────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-8 border-b border-white/[0.08]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center border border-white/10 shadow-inner-glow">
            <CircleUserRound size={32} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">{user.name || 'BookIt User'}</h1>
            <p className="text-text-muted text-sm">{user.phone} {user.email && `• ${user.email}`}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="badge-brand bg-brand-500/10 border-brand-500/20 text-xs shadow-glow">
                <Ticket size={12} className="mr-1" />
                {user.loyalty_coins} Coins
              </span>
              {user.role === 'organiser' && (
                <Link href="/organiser/dashboard" className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2">
                  Organiser Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <LogOut size={18} />
          Sign Out
        </button>
      </div>

      <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
        <Ticket size={24} className="text-brand-500" />
        My Tickets
      </h2>

      {/* ─── Bookings List ────────────────────────────── */}
      {bookings && bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((booking) => {
            const eventDate = new Date(booking.events.starts_at)
            const isPast = eventDate < new Date()
            
            return (
              <div 
                key={booking.id} 
                className={`card p-0 flex flex-col md:flex-row overflow-hidden relative group transition-all duration-300 ${isPast ? 'opacity-70 saturate-50' : ''}`}
              >
                {/* Status bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 z-10 
                  ${booking.status === 'confirmed' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                    booking.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} 
                />

                {/* Left side: Poster */}
                <div className="w-full md:w-48 h-48 md:h-auto bg-surface-700 relative shrink-0">
                  {booking.events.poster_url ? (
                    <Image 
                      src={booking.events.poster_url} 
                      alt={booking.events.title} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted font-display bg-gradient-to-br from-surface-800 to-surface-700">
                      {booking.events.title.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {isPast && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="badge bg-surface-900 border-white/10 shadow-xl font-bold uppercase tracking-wider text-xs">Past Event</span>
                    </div>
                  )}
                </div>

                {/* Right side: Details */}
                <div className="p-6 flex-1 flex flex-col justify-between relative bg-surface-800/40">
                  {/* Perforation line (visual only) */}
                  <div className="hidden md:block absolute top-[10%] bottom-[10%] left-[-1px] w-[2px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyIiBoZWlnaHQ9IjEyIj48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI2IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L3N2Zz4=')] bg-repeat-y z-20"></div>

                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:text-brand-400 transition-colors">
                        <Link href={`/events/${booking.id}`}>{booking.events.title}</Link>
                      </h3>
                      <div className="space-y-1.5 text-sm text-text-muted">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-brand-500" />
                          <span>{eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-blue-400" />
                          <span>{booking.events.venue_name}, {booking.events.city}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md whitespace-nowrap border self-start shadow-xl
                      ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        booking.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'}`}
                    >
                      {booking.status}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed border-white/10 flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-xs text-text-subtle block mb-0.5 uppercase tracking-wide">Total Paid</span>
                      <div className="font-display font-bold text-lg text-white flex items-center">
                        <IndianRupee size={16} className="mr-0.5 text-text-muted" />
                        {booking.total_amount}
                      </div>
                    </div>

                    {booking.status === 'confirmed' && !isPast && (
                      <Link href={`/profile/bookings/${booking.id}` as any} className="btn-secondary px-4 py-2 text-sm bg-surface-900 border-white/10 shadow-glow">
                        <QrCode size={16} />
                        View Ticket
                      </Link>
                    )}
                    
                    {booking.status === 'pending' && (
                      <Link href={`/profile/bookings/${booking.id}/pay` as any} className="btn-primary px-4 py-2 text-sm shadow-glow">
                        Pay Now
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card p-12 text-center border-dashed border-border/50 bg-surface-800/20">
          <Ticket className="mx-auto text-text-subtle mb-4" size={48} />
          <h3 className="text-xl font-display font-bold mb-2">No bookings found</h3>
          <p className="text-text-muted mb-6 max-w-sm mx-auto">You haven't booked any tickets yet. Explore exciting events happening around you.</p>
          <Link href="/events" className="btn-primary inline-flex justify-center shadow-glow font-medium px-8">
            Explore Events
          </Link>
        </div>
      )}
    </div>
  )
}
