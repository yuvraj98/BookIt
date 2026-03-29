'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import {
  Star, Clock, Film, Calendar, ChevronRight, MapPin, Tv2,
  Clapperboard, Users, Shield, ChevronLeft, CheckCircle2,
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface ShowSlot {
  id: string
  show_time: string
  show_date: string
  language: string
  screen_type: string
  screen_number: number
  prices: {
    RECLINER: number
    GOLD: number
    SILVER: number
    ECONOMY: number
  }
}

interface TheatreWithShows {
  theatre: {
    id: string
    name: string
    address: string
    city: string
    amenities: string[]
  }
  shows: ShowSlot[]
}

// Generate next 7 day dates
function getNextDays(count = 7) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return {
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      date: d.toISOString().split('T')[0],
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-IN', { month: 'short' }),
    }
  })
}

export function MovieDetail({ movieId }: { movieId: string }) {
  const days = getNextDays()
  const [selectedDate, setSelectedDate] = useState(days[0].date)

  const { data: movie, isLoading: movieLoading } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: async () => {
      const res = await api.get<{ data: any }>(`/movies/${movieId}`)
      return res.data.data
    },
  })

  const { data: showsData, isLoading: showsLoading } = useQuery({
    queryKey: ['movie-shows', movieId, selectedDate],
    queryFn: async () => {
      const res = await api.get<{ data: { theatres: TheatreWithShows[] } }>(
        `/movies/${movieId}/shows?date=${selectedDate}&city=Pune`
      )
      return res.data.data.theatres
    },
  })

  if (movieLoading) {
    return (
      <div className="section animate-pulse">
        <div className="h-96 skeleton rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-10 skeleton w-2/3 rounded" />
            <div className="h-4 skeleton w-full rounded" />
            <div className="h-4 skeleton w-4/5 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!movie) return null

  return (
    <div className="min-h-screen">
      {/* ─── Hero Backdrop ─────────────────────────────────────── */}
      <div className="relative h-[70vh] overflow-hidden">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-full object-cover scale-105 blur-sm"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a0a2e] to-surface-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 to-transparent" />

        {/* Back button */}
        <Link
          href="/movies"
          className="absolute top-6 left-6 flex items-center gap-2 text-white/70 hover:text-white transition-colors backdrop-blur-sm bg-black/20 px-3 py-2 rounded-xl"
        >
          <ChevronLeft size={18} /> All Movies
        </Link>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 section pb-10">
          <div className="flex flex-col sm:flex-row gap-6 items-end sm:items-end">
            {/* Poster thumb */}
            <div className="w-32 h-48 rounded-xl overflow-hidden shrink-0 border-2 border-white/10 shadow-2xl hidden sm:block">
              {movie.poster_url ? (
                <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                  <Film size={32} className="text-white/20" />
                </div>
              )}
            </div>

            <div className="flex-1">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {movie.cbfc_rating}
                </span>
                {movie.genre?.map((g: string) => (
                  <span key={g} className="badge bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">{g}</span>
                ))}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3">{movie.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                {movie.imdb_rating && (
                  <span className="flex items-center gap-1">
                    <Star size={16} className="text-amber-400" fill="currentColor" />
                    <span className="font-bold text-white">{movie.imdb_rating}</span>/10 IMDb
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {movie.duration_minutes} min
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Film size={16} />
                  {movie.language}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content Area ──────────────────────────────────────── */}
      <div className="section pt-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Movie Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Clapperboard size={18} className="text-purple-400" />
                Movie Info
              </h2>
              <div className="space-y-3 text-sm">
                {movie.director && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Director</span>
                    <span className="font-medium text-white">{movie.director}</span>
                  </div>
                )}
                {movie.language && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Language</span>
                    <span className="font-medium text-white">{movie.language}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Duration</span>
                  <span className="font-medium text-white">{movie.duration_minutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Release</span>
                  <span className="font-medium text-white">
                    {new Date(movie.release_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Rating</span>
                  <span className="font-medium text-white bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
                    {movie.cbfc_rating}
                  </span>
                </div>
              </div>

              {movie.cast_members && movie.cast_members.length > 0 && (
                <div className="mt-5 pt-4 border-t border-white/5">
                  <p className="text-text-muted text-xs uppercase tracking-wider font-bold mb-3">
                    <Users size={12} className="inline mr-1.5" />
                    Cast
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {movie.cast_members.map((name: string) => (
                      <span key={name} className="text-xs bg-surface-700 text-text-muted px-2 py-1 rounded-lg">{name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="card p-6">
              <h2 className="font-display font-bold text-lg mb-3">About</h2>
              <p className="text-text-muted text-sm leading-relaxed">{movie.description}</p>
            </div>
          </div>

          {/* Right: Shows */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
              <Calendar size={20} className="text-purple-400" />
              Select Date & Show
            </h2>

            {/* Date Selector */}
            <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
              {days.map(day => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[68px] transition-all font-bold ${
                    selectedDate === day.date
                      ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                      : 'bg-surface-800 text-text-muted hover:text-white border border-white/5'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wider mb-1">{day.label}</span>
                  <span className="text-xl">{day.dayNum}</span>
                  <span className="text-[10px] mt-0.5">{day.month}</span>
                </button>
              ))}
            </div>

            {/* Theatre + Show Listing */}
            {showsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="card h-36 skeleton" />
                ))}
              </div>
            ) : showsData && showsData.length > 0 ? (
              <div className="space-y-4">
                {showsData.map(({ theatre, shows }) => (
                  <motion.div
                    key={theatre.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5 hover:bg-surface-800/80 transition-colors"
                  >
                    {/* Theatre header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display font-bold text-white text-base flex items-center gap-2">
                          <Tv2 size={16} className="text-purple-400" />
                          {theatre.name}
                        </h3>
                        <p className="text-xs text-text-muted flex items-start gap-1 mt-1">
                          <MapPin size={11} className="mt-0.5 shrink-0" />
                          {theatre.address}
                        </p>
                      </div>
                      {theatre.amenities && theatre.amenities.length > 0 && (
                        <div className="flex gap-1 flex-wrap justify-end max-w-[150px]">
                          {theatre.amenities.slice(0, 3).map(a => (
                            <span key={a} className="text-[9px] bg-surface-700 text-text-subtle px-1.5 py-0.5 rounded uppercase tracking-wider">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Show times */}
                    <div className="flex flex-wrap gap-2">
                      {shows.map(show => (
                        <Link
                          key={show.id}
                          href={`/movies/shows/${show.id}`}
                          className="group relative flex flex-col items-center border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/15 hover:border-emerald-400/60 rounded-xl px-4 py-3 transition-all"
                        >
                          <span className="font-bold text-emerald-400 text-base">{show.show_time.slice(0, 5)}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-surface-700 text-text-muted px-1.5 py-0.5 rounded uppercase font-bold">
                              {show.screen_type}
                            </span>
                            <span className="text-[10px] text-text-subtle">{show.language}</span>
                          </div>
                          <div className="text-[10px] text-text-subtle mt-1">
                            from <span className="text-white font-bold">₹{Math.min(...Object.values(show.prices))}</span>
                          </div>
                          <ChevronRight
                            size={14}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="card p-12 text-center border border-dashed border-border bg-transparent">
                <Film size={48} className="mx-auto text-surface-600 mb-4" />
                <p className="text-text-muted mb-2">No shows available for this date.</p>
                <p className="text-text-subtle text-xs">Try a different date or check back later.</p>
              </div>
            )}

            {/* Info bar */}
            <div className="mt-6 flex flex-wrap gap-4 text-xs text-text-subtle">
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-emerald-500/40 bg-emerald-500/10 rounded" />
                Available
              </span>
              <span className="flex items-center gap-1.5">
                <Shield size={12} className="text-purple-400" />
                Secure payment via BookIt
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" />
                Instant e-ticket on confirmation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
