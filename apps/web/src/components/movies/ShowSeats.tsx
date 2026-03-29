'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import {
  Tv2, MapPin, Clock, ArrowRight, Loader2, ChevronLeft,
  Film, MonitorPlay, Info, ShoppingBag, X, Star,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

type SeatStatus = 'available' | 'locked' | 'booked'
type SeatCategory = 'RECLINER' | 'GOLD' | 'SILVER' | 'ECONOMY'

interface ShowSeat {
  id: string
  label: string
  row_label: string
  col_number: number
  category: SeatCategory
  price: number
  status: SeatStatus
}

interface SeatRow {
  label: string
  seats: ShowSeat[]
}

interface ShowDetail {
  id: string
  show_date: string
  show_time: string
  language: string
  price_recliner: number
  price_gold: number
  price_silver: number
  price_economy: number
  movies: {
    id: string
    title: string
    poster_url: string | null
    duration_minutes: number
    genre: string[]
    cbfc_rating: string
  }
  screens: {
    screen_number: number
    screen_type: string
    theatres: {
      name: string
      address: string
      city: string
    }
  }
}

const CATEGORY_STYLES: Record<SeatCategory, { color: string; bg: string; border: string; label: string }> = {
  RECLINER: { color: 'text-purple-300', bg: 'bg-purple-900/40', border: 'border-purple-500/50', label: 'Recliner' },
  GOLD:     { color: 'text-amber-300',  bg: 'bg-amber-900/30',  border: 'border-amber-500/40',  label: 'Gold' },
  SILVER:   { color: 'text-sky-300',    bg: 'bg-sky-900/30',    border: 'border-sky-500/40',    label: 'Silver' },
  ECONOMY:  { color: 'text-slate-300',  bg: 'bg-slate-900/30',  border: 'border-slate-500/30',  label: 'Economy' },
}

const SELECTED_STYLE = 'bg-brand-500 border-brand-400 text-white shadow-[0_0_12px_rgba(255,61,37,0.5)]'
const BOOKED_STYLE  = 'bg-surface-700/50 border-surface-600/50 text-surface-600 cursor-not-allowed'

export function ShowSeats({ showId }: { showId: string }) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [selectedSeats, setSelectedSeats] = useState<ShowSeat[]>([])

  // Fetch show detail
  const { data: show, isLoading: showLoading } = useQuery({
    queryKey: ['show', showId],
    queryFn: async () => {
      const res = await api.get<{ data: ShowDetail }>(`/shows/${showId}`)
      return res.data.data
    },
  })

  // Fetch seats
  const { data: seatData, isLoading: seatsLoading } = useQuery({
    queryKey: ['show-seats', showId],
    queryFn: async () => {
      const res = await api.get<{ data: { rows: SeatRow[]; category_stats: Record<string, any> } }>(`/shows/${showId}/seats`)
      return res.data.data
    },
    refetchInterval: 30000, // refresh every 30s to catch locked seats
  })

  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<{ data: any }>('/shows/book', {
        show_id: showId,
        seat_ids: selectedSeats.map(s => s.id),
      })
      return res.data.data
    },
    onSuccess: (booking) => {
      toast.success('Seats locked! Proceeding to payment...')
      router.push(`/movies/booking/${booking.id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || 'Failed to book seats. Please try again.')
    },
  })

  const handleSeatClick = (seat: ShowSeat) => {
    if (seat.status !== 'available') return
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    if (isSelected) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))
    } else {
      if (selectedSeats.length >= 10) {
        toast.error('You can select a maximum of 10 seats')
        return
      }
      setSelectedSeats(prev => [...prev, seat])
    }
  }

  const totalAmount = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + s.price, 0),
    [selectedSeats]
  )

  const convFee = Math.round(totalAmount * 0.03)

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets')
      router.push('/login')
      return
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }
    bookMutation.mutate()
  }

  if (showLoading || seatsLoading) {
    return (
      <div className="section animate-pulse space-y-6 pt-8">
        <div className="h-24 skeleton rounded-2xl" />
        <div className="h-12 w-48 skeleton rounded-xl mx-auto" />
        <div className="h-[400px] skeleton rounded-2xl" />
      </div>
    )
  }

  if (!show || !seatData) return null

  const { rows, category_stats } = seatData
  const screen = show.screens as any
  const theatre = screen.theatres
  const movie = show.movies

  // Group rows by category
  const rowsByCategory = new Map<SeatCategory, SeatRow[]>()
  for (const row of rows) {
    const firstSeat = row.seats[0]
    if (!firstSeat) continue
    const cat = firstSeat.category
    if (!rowsByCategory.has(cat)) rowsByCategory.set(cat, [])
    rowsByCategory.get(cat)!.push(row)
  }

  const categoryOrder: SeatCategory[] = ['RECLINER', 'GOLD', 'SILVER', 'ECONOMY']

  return (
    <div className="min-h-screen pb-36">
      {/* ─── Show Info Bar ───────────────────────────────────── */}
      <div className="bg-surface-900 border-b border-white/5 sticky top-16 z-30">
        <div className="section py-4 flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/movies/${movie.id}`} className="text-text-muted hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="font-display font-bold text-white text-lg">{movie.title}</h1>
              <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                <span className="flex items-center gap-1"><Tv2 size={12} />{theatre.name}</span>
                <span className="flex items-center gap-1"><Clock size={12} />{show.show_time.slice(0, 5)}</span>
                <span className="bg-surface-700 px-2 py-0.5 rounded text-text-subtle uppercase text-[10px] font-bold">{screen.screen_type}</span>
                <span className="text-text-subtle">{show.language}</span>
              </div>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <p className="text-text-muted text-xs">
              {new Date(`${show.show_date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <p className="text-text-subtle text-xs flex items-center justify-end gap-1">
              <MapPin size={11} /> {theatre.address}
            </p>
          </div>
        </div>
      </div>

      <div className="section pt-8">
        {/* ─── Category Legend ─────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {Object.entries(category_stats)
            .sort((a, b) => categoryOrder.indexOf(a[0] as SeatCategory) - categoryOrder.indexOf(b[0] as SeatCategory))
            .map(([cat, stats]: [string, any]) => {
              const style = CATEGORY_STYLES[cat as SeatCategory]
              return (
                <div key={cat} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${style.border} ${style.bg}`}>
                  <div className={`w-4 h-4 rounded-sm border ${style.border} ${style.bg}`} />
                  <span className={`text-xs font-bold ${style.color}`}>{style.label}</span>
                  <span className="text-xs text-text-subtle">₹{stats.price}</span>
                  <span className="text-[10px] text-text-subtle">({stats.available}/{stats.total})</span>
                </div>
              )
            })}
        </div>

        {/* ─── Screen Indicator ────────────────────────────────── */}
        <div className="relative mb-12 flex flex-col items-center">
          <div className="w-3/4 max-w-xl h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full shadow-[0_4px_20px_rgba(255,255,255,0.3)]" />
          <div className="w-4/5 max-w-2xl h-4 bg-gradient-to-b from-white/5 to-transparent rounded-b-3xl" />
          <span className="mt-2 text-[11px] text-text-subtle uppercase tracking-[0.3em] font-bold">All Eyes This Way — Screen {screen.screen_number}</span>
        </div>

        {/* ─── Seat Grid ────────────────────────────────────────── */}
        <div className="overflow-x-auto custom-scrollbar pb-4">
          <div className="min-w-max mx-auto">
            {categoryOrder.map(category => {
              const catRows = rowsByCategory.get(category)
              if (!catRows || catRows.length === 0) return null
              const style = CATEGORY_STYLES[category]

              return (
                <div key={category} className="mb-8">
                  {/* Category Header */}
                  <div className={`flex items-center gap-2 justify-center mb-4 py-1.5 px-4 rounded-full border mx-auto w-fit ${style.border} ${style.bg}`}>
                    <Star size={12} className={style.color} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${style.color}`}>{style.label}</span>
                    <span className="text-text-subtle text-xs">· ₹{category_stats[category]?.price}</span>
                  </div>

                  {/* Rows */}
                  {catRows.map(row => (
                    <div key={row.label} className="flex items-center gap-2 mb-2 justify-center">
                      <span className="w-6 text-center text-xs font-bold text-text-subtle">{row.label}</span>
                      <div className="flex gap-1.5">
                        {row.seats.map(seat => {
                          const isSelected = selectedSeats.some(s => s.id === seat.id)
                          const isUnavailable = seat.status !== 'available'

                          return (
                            <button
                              key={seat.id}
                              onClick={() => handleSeatClick(seat)}
                              disabled={isUnavailable}
                              title={`${seat.label} · ₹${seat.price} · ${seat.status}`}
                              className={`
                                w-7 h-7 rounded-t-lg rounded-b-sm text-[9px] font-bold
                                border transition-all duration-150 flex items-center justify-center
                                ${isSelected
                                  ? SELECTED_STYLE
                                  : isUnavailable
                                    ? BOOKED_STYLE
                                    : `${style.bg} ${style.border} ${style.color} hover:scale-110 hover:brightness-125`
                                }
                              `}
                            >
                              {seat.col_number}
                            </button>
                          )
                        })}
                      </div>
                      <span className="w-6 text-center text-xs font-bold text-text-subtle">{row.label}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── Legend ──────────────────────────────────────────── */}
        <div className="flex justify-center gap-6 text-xs text-text-muted mt-4">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-surface-800 border border-white/10" />
            Available
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-brand-500 shadow-[0_0_8px_rgba(255,61,37,0.5)]" />
            Selected
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-t-md rounded-b-sm bg-surface-700/50 border border-surface-600/50" />
            Unavailable
          </div>
        </div>
      </div>

      {/* ─── Booking Summary Footer ──────────────────────────── */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-surface-900/95 backdrop-blur-xl border-t border-white/10 shadow-2xl">
              <div className="section py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedSeats.map(seat => (
                        <span
                          key={seat.id}
                          className="bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs px-2 py-1 rounded-lg flex items-center gap-1"
                        >
                          {seat.label}
                          <button
                            onClick={() => setSelectedSeats(prev => prev.filter(s => s.id !== seat.id))}
                            className="hover:text-white transition-colors"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-text-muted">
                        {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
                      </span>
                      <span className="text-text-subtle text-xs">+₹{convFee} conv. fee</span>
                      <span className="text-white font-display font-bold text-lg">
                        ₹{totalAmount + convFee}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceed}
                    disabled={bookMutation.isPending}
                    className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-bold whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #9333ea)' }}
                  >
                    {bookMutation.isPending ? (
                      <><Loader2 size={18} className="animate-spin" /> Locking...</>
                    ) : (
                      <><ShoppingBag size={18} /> Proceed to Pay <ArrowRight size={18} /></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
