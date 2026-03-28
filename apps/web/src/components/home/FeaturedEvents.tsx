'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Calendar, MapPin, Clock, Tag } from 'lucide-react'

// Mock featured events — will be replaced with API data in Sprint 4
const FEATURED_EVENTS = [
  {
    id: '1',
    emoji: '🎭',
    title: 'Abhishek Upmanyu LIVE — Mostly Harmless',
    category: 'Comedy',
    venue: 'Blue Frog, Pune',
    date: 'Sat, 5 Apr 2025',
    time: '8:00 PM',
    price: '₹799',
    originalPrice: '₹999',
    seats: 42,
    poster_bg: 'from-violet-600/20 to-purple-900/40',
    badge: '🔥 Selling Fast',
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  },
  {
    id: '2',
    emoji: '🎵',
    title: 'NH7 Weekender 2025 — Pune Edition',
    category: 'Music',
    venue: 'Mahalaxmi Lawns, Pune',
    date: 'Sat–Sun, 12–13 Apr',
    time: '3:00 PM onwards',
    price: '₹1,499',
    seats: 120,
    poster_bg: 'from-amber-600/20 to-orange-900/40',
    badge: '⭐ Featured',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  {
    id: '3',
    emoji: '💻',
    title: 'Pune Startup Weekend 2025',
    category: 'Tech',
    venue: 'WeWork Pune, Kalyani Nagar',
    date: 'Fri–Sun, 18–20 Apr',
    time: '9:00 AM',
    price: 'Free',
    seats: 200,
    poster_bg: 'from-cyan-600/20 to-blue-900/40',
    badge: '🆓 Free Event',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  {
    id: '4',
    emoji: '🏋️',
    title: 'Yoga & Wellness Retreat — Outdoor',
    category: 'Fitness',
    venue: 'Aundh Riverfront, Pune',
    date: 'Sun, 6 Apr 2025',
    time: '6:30 AM',
    price: '₹299',
    seats: 30,
    poster_bg: 'from-emerald-600/20 to-teal-900/40',
    badge: '🌟 New',
    badgeColor: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  },
]

export function FeaturedEvents() {
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
          <p className="text-[#a0a0a0]">Handpicked events happening this week in Pune</p>
        </div>
        <Link href="/events" className="btn-ghost text-sm hidden sm:inline-flex">
          View all →
        </Link>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURED_EVENTS.map((event, i) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link href={`/events/${event.id}`} className="block h-full group">
              <div className="card overflow-hidden h-full flex flex-col hover:-translate-y-1 transition-all duration-300">
                {/* Poster */}
                <div className={`relative h-40 bg-gradient-to-br ${event.poster_bg} flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-500">
                    {event.emoji}
                  </span>
                  <div className="absolute top-3 left-3">
                    <span className={`badge text-[11px] px-2.5 py-1 border ${event.badgeColor}`}>
                      {event.badge}
                    </span>
                  </div>
                  {event.seats < 50 && (
                    <div className="absolute bottom-3 right-3">
                      <span className="badge text-[10px] bg-red-500/20 text-red-400 border-red-500/20">
                        Only {event.seats} left
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-medium text-brand-400 uppercase tracking-wider mb-1">
                    {event.category}
                  </span>
                  <h3 className="font-semibold text-white leading-tight mb-3 flex-1 line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#606060]">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-brand-500" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08]">
                    <div>
                      <span className="text-lg font-bold text-white">{event.price}</span>
                      {event.originalPrice && (
                        <span className="text-xs text-[#606060] line-through ml-1.5">
                          {event.originalPrice}
                        </span>
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
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link href="/events" className="btn-secondary text-sm">
          View all events →
        </Link>
      </div>
    </section>
  )
}
