'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Calendar, MapPin, Clock, IndianRupee, Sparkles } from 'lucide-react'

interface EventItem {
  id: string
  title: string
  category: string
  city: string
  venue_name: string
  starts_at: string
  poster_url: string | null
  min_price: number
  available_seats: number
  total_capacity: number
  organisers: { business_name: string }
}

const CATEGORY_COLORS: Record<string, string> = {
  comedy: 'from-violet-600/20 to-purple-900/40',
  music: 'from-amber-600/20 to-orange-900/40',
  tech: 'from-cyan-600/20 to-blue-900/40',
  sports: 'from-emerald-600/20 to-teal-900/40',
  workshop: 'from-pink-600/20 to-rose-900/40',
  theatre: 'from-indigo-600/20 to-blue-900/40',
  food: 'from-orange-600/20 to-red-900/40',
  art: 'from-fuchsia-600/20 to-purple-900/40',
  fitness: 'from-lime-600/20 to-green-900/40',
  default: 'from-brand-600/20 to-brand-900/40',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  comedy: '🎭',
  music: '🎵',
  tech: '💻',
  sports: '⚽',
  workshop: '🛠️',
  theatre: '🎬',
  food: '🍕',
  art: '🎨',
  fitness: '🏋️',
  festival: '🎉',
  nightlife: '🌙',
  kids: '🧸',
  default: '🎪',
}

export function FeaturedEvents() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['featuredEvents'],
    queryFn: async () => {
      const { data } = await api.get<{ data: { items: EventItem[] } }>('/events?limit=4&featured=true')
      // If no featured events, fall back to latest approved events
      if (data.data.items.length === 0) {
        const fallback = await api.get<{ data: { items: EventItem[] } }>('/events?limit=4')
        return fallback.data.data.items
      }
      return data.data.items
    },
  })

  return (
    <section className="section">
      <motion.div
        className="flex items-end justify-between mb-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-2">Featured Events</h2>
          <p className="text-[#a0a0a0]">Handpicked events happening soon near you</p>
        </div>
        <Link href="/events" className="btn-ghost text-sm hidden sm:inline-flex">
          View all →
        </Link>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {isLoading ? (
          // Skeleton loading
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-40 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-16 skeleton rounded" />
                <div className="h-6 w-3/4 skeleton rounded" />
                <div className="h-4 w-1/2 skeleton rounded" />
                <div className="h-4 w-1/3 skeleton rounded" />
                <div className="h-10 w-full skeleton rounded-xl mt-2" />
              </div>
            </div>
          ))
        ) : events && events.length > 0 ? (
          events.map((event, i) => {
            const eventDate = new Date(event.starts_at)
            const gradient = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default
            const emoji = CATEGORY_EMOJIS[event.category] || CATEGORY_EMOJIS.default
            const seatsLeft = event.available_seats
            const isFilling = seatsLeft < 50 && seatsLeft > 0

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <Link href={`/events/${event.id}` as any} className="block h-full group">
                  <div className="card overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-all duration-300">
                    {/* Poster */}
                    <div className={`relative h-40 overflow-hidden`}>
                      {event.poster_url ? (
                        <Image
                          src={event.poster_url}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                          <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                            {emoji}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-900/60 to-transparent" />

                      <div className="absolute top-3 left-3">
                        <span className="badge-brand backdrop-blur-md bg-surface-900/60 capitalize text-[11px] px-2.5 py-1">
                          {event.category}
                        </span>
                      </div>

                      {isFilling && (
                        <div className="absolute bottom-3 right-3">
                          <span className="badge text-[10px] bg-red-500/20 text-red-400 border border-red-500/20 backdrop-blur-md">
                            🔥 Only {seatsLeft} left
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-white leading-tight mb-3 flex-1 line-clamp-2 group-hover:text-brand-400 transition-colors">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-brand-500/70" />
                          {eventDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          {eventDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-400/70" />
                          <span className="truncate">{event.venue_name}, {event.city}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                        <div>
                          {event.min_price > 0 ? (
                            <span className="text-lg font-bold text-white flex items-center">
                              <IndianRupee size={14} className="mr-0.5 opacity-70" />
                              {event.min_price}
                            </span>
                          ) : (
                            <span className="text-lg font-bold text-emerald-400">Free</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-brand-400 group-hover:translate-x-0.5 transition-transform">
                          Book →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })
        ) : (
          // No events fallback
          <div className="col-span-full text-center py-16 card border-dashed border-border/50 bg-surface-800/20">
            <Sparkles className="mx-auto text-brand-500 mb-4" size={32} />
            <h3 className="text-lg font-display font-bold mb-2">Events coming soon!</h3>
            <p className="text-text-muted text-sm">Check back shortly for upcoming events in your city.</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link href="/events" className="btn-secondary text-sm">
          View all events →
        </Link>
      </div>
    </section>
  )
}
