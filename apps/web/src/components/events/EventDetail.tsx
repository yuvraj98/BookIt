'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Calendar, MapPin, Tag, Info, IndianRupee, Clock, Building2, ChevronRight, CheckCircle2, Share2, Copy, Twitter, MessageCircle, Timer } from 'lucide-react'

interface SeatSection {
  id: string
  label: string
  price: number
  available_seats: number
  total_seats: number
}

interface Seat {
  id: string
  section_id: string
  label: string
  status: 'available' | 'locked' | 'booked'
  row_number: number
  col_number: number
}

interface EventData {
  id: string
  title: string
  description: string
  category: string
  city: string
  venue_name: string
  venue_address: string
  starts_at: string
  poster_url: string | null
  organisers: { business_name: string }
  seat_sections: SeatSection[]
}

export function EventDetail({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  
  const [selectedSection, setSelectedSection] = useState<SeatSection | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [isBooking, setIsBooking] = useState(false)

  // Fetch Event Details
  const { data: event, isLoading: eventLoading, isError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data } = await api.get<{ data: EventData }>(`/events/${eventId}`)
      return data.data
    },
  })

  // Fetch Seats for the selected section
  const { data: seats, isLoading: seatsLoading } = useQuery({
    queryKey: ['seats', eventId, selectedSection?.id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Seat[] }>(`/events/${eventId}/seats`)
      return data.data.filter(s => s.section_id === selectedSection?.id)
    },
    enabled: !!selectedSection,
  })

  const handleSeatToggle = (seat: Seat) => {
    if (seat.status !== 'available') return

    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seat.id)
      if (isSelected) {
        return prev.filter(s => s.id !== seat.id)
      } else {
        if (prev.length >= 10) {
          toast.error("You can select maximum 10 seats")
          return prev
        }
        return [...prev, seat]
      }
    })
  }

  const handleBookTickets = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets')
      router.push(`/login?redirect=/events/${eventId}`)
      return
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    setIsBooking(true)
    try {
      const res = await api.post('/bookings', {
        event_id: eventId,
        seat_ids: selectedSeats.map(s => s.id)
      })
      
      const bookingId = res.data.data?.id
      toast.success('Booking initiated! Proceeding to payment.')
      // Redirect to payment simulation page
      if (bookingId) {
        router.push(`/profile/bookings/${bookingId}/pay`)
      } else {
        router.push('/profile/bookings')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Booking failed')
    } finally {
      setIsBooking(false)
    }
  }

  if (eventLoading) {
    return (
      <div className="section animate-pulse">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="aspect-[21/9] w-full skeleton rounded-3xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="skeleton h-12 w-3/4 rounded-xl" />
              <div className="skeleton h-6 w-1/2 rounded" />
              <div className="skeleton h-40 w-full rounded-2xl mt-8" />
            </div>
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="section text-center py-32">
        <h1 className="text-3xl font-bold font-display text-white mb-4">Event not found</h1>
        <p className="text-text-muted mb-8">The event you're looking for might have been moved or removed.</p>
        <button onClick={() => router.push('/events')} className="btn-primary">
          Browse Events
        </button>
      </div>
    )
  }

  const dateObject = new Date(event.starts_at)
  const isPast = dateObject < new Date()

  return (
    <div className="section max-w-6xl mx-auto animate-in">
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <div className="relative aspect-[21/9] lg:aspect-[21/8] w-full rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-12 shadow-2xl">
        {event.poster_url ? (
          <Image
            src={event.poster_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-800 to-surface-900 flex items-center justify-center">
            <span className="font-display font-bold text-4xl text-white/10 text-center tracking-wider uppercase px-4">{event.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 flex flex-col md:flex-row gap-6 justify-between items-end">
          <div className="w-full md:w-2/3">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge-brand backdrop-blur-md bg-surface-900/60 uppercase text-xs md:text-sm shadow-xl">
                {event.category}
              </span>
              {isPast && (
                <span className="badge bg-red-500/80 text-white backdrop-blur-md uppercase text-xs shadow-xl">
                  Completed
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4 leading-tight">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm md:text-base text-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="text-brand-400" size={18} />
                <span className="font-medium">
                  {dateObject.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="text-blue-400" size={18} />
                <span className="font-medium">
                  {dateObject.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Share & Countdown Bar ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 md:mb-12">
        {/* Countdown */}
        {!isPast && (
          <CountdownTimer targetDate={dateObject} />
        )}
        {isPast && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
            <Clock size={16} /> Event has ended
          </div>
        )}

        {/* Share Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-subtle uppercase tracking-wider font-bold mr-1">Share</span>
          <button
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : ''
              const text = `Check out ${event.title} on BookIt!`
              window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
            }}
            className="w-9 h-9 rounded-lg border border-white/10 bg-surface-800 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all"
            title="Share on WhatsApp"
          >
            <MessageCircle size={16} />
          </button>
          <button
            onClick={() => {
              const url = typeof window !== 'undefined' ? window.location.href : ''
              const text = `Check out ${event.title} on BookIt!`
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
            }}
            className="w-9 h-9 rounded-lg border border-white/10 bg-surface-800 flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
            title="Share on Twitter"
          >
            <Twitter size={16} />
          </button>
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined') {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied!')
              }
            }}
            className="w-9 h-9 rounded-lg border border-white/10 bg-surface-800 flex items-center justify-center text-text-muted hover:bg-surface-700 hover:border-white/20 transition-all"
            title="Copy Link"
          >
            <Copy size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left Column: Info ─────────────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2 border-b border-border pb-4">
              <Info className="text-brand-500" size={20} />
              About the Event
            </h2>
            <div className="prose prose-invert max-w-none text-text-muted leading-relaxed whitespace-pre-wrap">
              {event.description}
            </div>
          </div>

          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-display font-bold flex items-center gap-2 border-b border-border pb-4">
              <Building2 className="text-blue-500" size={20} />
              Venue & Organiser
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm text-text-subtle font-medium uppercase tracking-wider">Venue Location</h3>
                <div className="flex gap-3 items-start">
                  <div className="w-10 h-10 rounded-full bg-surface-700 flex items-center justify-center shrink-0">
                    <MapPin className="text-white" size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{event.venue_name}</h4>
                    <p className="text-text-muted mt-1">{event.venue_address}</p>
                    <p className="text-text-muted">{event.city}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 md:pl-6 md:border-l border-border">
                <h3 className="text-sm text-text-subtle font-medium uppercase tracking-wider">Organised By</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shrink-0 shadow-glow">
                    <span className="font-bold text-white text-sm">
                      {event.organisers?.business_name?.substring(0, 2).toUpperCase() || 'OG'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-lg">{event.organisers?.business_name || 'Verified Organiser'}</h4>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ─── Right Column: Ticketing ────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="card p-6 md:p-8 sticky top-24">
            
            <h2 className="text-xl font-display font-bold border-b border-border pb-4 mb-6 flex items-center justify-between">
              Buy Tickets
              {selectedSeats.length > 0 && (
                <span className="badge-brand animate-in fade-in zoom-in">{selectedSeats.length} Selected</span>
              )}
            </h2>

            {isPast ? (
              <div className="py-8 text-center bg-surface-800 rounded-xl border border-red-500/20">
                <Clock className="mx-auto text-red-400 mb-3" size={32} />
                <h3 className="text-lg font-bold">Event Ended</h3>
                <p className="text-text-muted text-sm mt-1">Bookings are closed.</p>
              </div>
            ) : (
              <>
                {!selectedSection ? (
                  /* Step 1: Select Section */
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <h3 className="text-sm text-text-subtle font-medium uppercase tracking-wider mb-2">Select Section</h3>
                    {event.seat_sections?.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setSelectedSection(section)}
                        disabled={section.available_seats === 0}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group
                          ${section.available_seats === 0 
                            ? 'opacity-50 cursor-not-allowed border-border/50 bg-surface-900' 
                            : 'border-white/10 hover:border-brand-500/50 hover:bg-surface-800 bg-surface-900 hover:shadow-glow'
                          }`}
                      >
                        <div>
                          <div className="font-bold text-white text-lg flex items-center gap-2">
                            {section.label}
                            {section.available_seats > 0 && section.available_seats <= 10 && (
                              <span className="text-[10px] font-bold bg-amber-500 text-amber-950 px-2 py-0.5 rounded-full">Fast filling</span>
                            )}
                          </div>
                          <div className="text-brand-400 font-bold flex items-center mt-1">
                            <IndianRupee size={14} className="mr-0.5" />
                            {section.price}
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className={`text-sm ${section.available_seats === 0 ? 'text-red-400' : 'text-text-muted group-hover:text-white transition-colors'}`}>
                            {section.available_seats === 0 ? 'Sold Out' : 'Available'}
                          </span>
                          {section.available_seats > 0 && (
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center mt-2 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                              <ChevronRight size={18} />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Step 2: Select Seats */
                  <div className="animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                      <div>
                        <button 
                          onClick={() => { setSelectedSection(null); setSelectedSeats([]) }}
                          className="text-xs text-brand-400 hover:text-brand-300 font-medium uppercase tracking-wider mb-1"
                        >
                          ← Change Section
                        </button>
                        <h3 className="text-xl font-bold font-display text-white">{selectedSection.label}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white flex items-center">
                          <IndianRupee size={20} className="mr-0.5" />
                          {selectedSection.price}
                        </div>
                        <span className="text-xs text-text-muted">per ticket</span>
                      </div>
                    </div>

                    {seatsLoading ? (
                      <div className="py-12 flex justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Seat Map abstraction (Simplified grid) */}
                        <div className="bg-surface-900 rounded-2xl p-6 border border-white/[0.05] overflow-x-auto custom-scrollbar relative">
                          {/* Screen curve indicator */}
                          <div className="w-3/4 h-2 bg-gradient-to-r from-transparent via-white/20 to-transparent mx-auto rounded-full mb-8 shadow-[0_4px_12px_rgba(255,255,255,0.1)] relative">
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-text-subtle font-bold">Stage</span>
                          </div>

                          <div className="flex flex-col gap-2 items-center min-w-max mt-8">
                            {/* Grouping seats by row assuming format A1, A2 etc */}
                            {Array.from(new Set(seats?.map(s => s.label.charAt(0)))).map(rowChar => (
                              <div key={rowChar} className="flex gap-2 items-center">
                                <span className="w-6 text-center text-xs font-bold text-text-subtle">{rowChar}</span>
                                <div className="flex gap-2">
                                  {seats?.filter(s => s.label.startsWith(rowChar)).map(seat => {
                                    const isSelected = selectedSeats.some(s => s.id === seat.id)
                                    return (
                                      <button
                                        key={seat.id}
                                        onClick={() => handleSeatToggle(seat)}
                                        disabled={seat.status !== 'available'}
                                        title={seat.label}
                                        className={`w-8 h-8 rounded-t-md rounded-b-sm text-[10px] font-bold transition-all flex items-center justify-center
                                          ${seat.status === 'locked' || seat.status === 'booked'
                                            ? 'bg-surface-700 text-surface-900 cursor-not-allowed border border-surface-600'
                                            : isSelected
                                              ? 'bg-brand-500 text-white shadow-glow translate-y-[-2px] border border-brand-400'
                                              : 'bg-surface-800 text-text-muted hover:bg-surface-700 hover:text-white border border-white/10 hover:border-brand-500/50'
                                          }
                                        `}
                                      >
                                        {isSelected ? <CheckCircle2 size={12} /> : seat.label.slice(1)}
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-t-sm bg-surface-800 border border-white/10"></div><span className="text-text-muted">Available</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-t-sm bg-brand-500 shadow-glow"></div><span className="text-text-muted">Selected</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-t-sm bg-surface-700"></div><span className="text-text-muted">Sold</span></div>
                        </div>

                        {/* Checkout Footer */}
                        {selectedSeats.length > 0 && (
                          <div className="bg-surface-800/50 border border-brand-500/20 rounded-xl p-4 mt-6 animate-in slide-up">
                            <div className="flex justify-between items-center mb-4 text-sm">
                              <span className="text-text-muted">Selected ({selectedSeats.length})</span>
                              <div className="font-bold flex items-center text-white">
                                <IndianRupee size={14} className="mr-0.5" />
                                {selectedSeats.length * selectedSection.price}
                                <span className="font-normal text-text-subtle text-xs ml-1">+ fees</span>
                              </div>
                            </div>
                            <button
                              onClick={handleBookTickets}
                              disabled={isBooking}
                              className="btn-primary w-full justify-center shadow-glow"
                            >
                              {isBooking ? (
                                <span className="flex items-center gap-2">
                                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                  Holding Seats...
                                </span>
                              ) : 'Proceed to Book'}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  )
}

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now())
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  const tiles = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hrs' },
    { value: timeLeft.minutes, label: 'Min' },
    { value: timeLeft.seconds, label: 'Sec' },
  ]

  return (
    <div className="flex items-center gap-2">
      <Timer size={16} className="text-brand-400 shrink-0" />
      <span className="text-xs text-text-subtle uppercase tracking-wider font-bold mr-1 hidden sm:inline">Starts in</span>
      <div className="flex gap-1.5">
        {tiles.map((t) => (
          <div key={t.label} className="text-center">
            <div className="bg-surface-800 border border-white/10 rounded-lg w-11 h-10 flex items-center justify-center">
              <span className="text-lg font-display font-bold text-white tabular-nums">{String(t.value).padStart(2, '0')}</span>
            </div>
            <span className="text-[9px] text-text-subtle uppercase tracking-wider font-bold mt-1 block">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
