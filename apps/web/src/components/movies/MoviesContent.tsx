'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Film, Search, Filter, Star, Clock, Clapperboard, ChevronRight, Flame, Calendar } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Movie {
  id: string
  title: string
  description: string
  genre: string[]
  language: string
  duration_minutes: number
  release_date: string
  director: string
  cast_members: string[]
  poster_url: string | null
  imdb_rating: number | null
  cbfc_rating: string
  status: 'now_showing' | 'coming_soon' | 'ended'
  is_featured: boolean
  tags: string[]
}

const LANGUAGES = ['All', 'Hindi', 'English', 'Marathi', 'Tamil', 'Telugu']
const GENRES = ['All', 'Action', 'Comedy', 'Drama', 'Thriller', 'Horror', 'Sci-Fi', 'Romance']

export function MoviesContent() {
  const [activeTab, setActiveTab] = useState<'now_showing' | 'coming_soon'>('now_showing')
  const [selectedLang, setSelectedLang] = useState('All')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['movies', activeTab, selectedLang, selectedGenre, search],
    queryFn: async () => {
      const params = new URLSearchParams({ status: activeTab, limit: '30' })
      if (selectedLang !== 'All') params.set('language', selectedLang)
      if (selectedGenre !== 'All') params.set('genre', selectedGenre)
      if (search) params.set('search', search)

      const res = await api.get<{ data: { items: Movie[] } }>(`/movies?${params}`)
      return res.data.data.items
    },
  })

  const featured = data?.filter(m => m.is_featured) || []
  const rest = data?.filter(m => !m.is_featured) || []

  return (
    <div className="min-h-screen">
      {/* ─── Hero Banner ──────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#12071a] via-surface-900 to-surface-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(139,92,246,0.2),transparent_70%)] pointer-events-none" />
        <div className="section pt-10 pb-16 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Clapperboard size={28} className="text-purple-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-purple-400">BookIt Cinema</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-white mb-4 leading-tight">
            Book <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Movie</span> Tickets
          </h1>
          <p className="text-text-muted text-lg mb-8 max-w-xl">
            Browse now showing & upcoming movies. Reserve your seats at the best theatres in your city.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search movies, genres, directors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-12 w-full text-base h-14 rounded-2xl border-white/10 focus:border-purple-500/50"
            />
          </div>
        </div>
      </div>

      <div className="section pb-20">
        {/* ─── Tabs ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('now_showing')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'now_showing'
                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                : 'bg-surface-800 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            <Flame size={16} />
            Now Showing
          </button>
          <button
            onClick={() => setActiveTab('coming_soon')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'coming_soon'
                ? 'bg-purple-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]'
                : 'bg-surface-800 text-text-muted hover:text-white border border-white/5'
            }`}
          >
            <Calendar size={16} />
            Coming Soon
          </button>
        </div>

        {/* ─── Filters ──────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <Filter size={14} className="text-text-subtle shrink-0" />
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedLang === lang
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-surface-800 text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-white/10 self-center hidden sm:block" />
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {GENRES.map(genre => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedGenre === genre
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    : 'bg-surface-800 text-text-muted hover:text-white border border-transparent'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* ─── Loading Skeleton ─────────────────────────────────── */}
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton rounded-2xl aspect-[2/3]" />
            ))}
          </div>
        )}

        {/* ─── Featured Row ──────────────────────────────────────── */}
        {!isLoading && featured.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-6">
              <Flame size={20} className="text-orange-400" />
              Featured / Blockbusters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.slice(0, 3).map((movie, i) => (
                <FeaturedMovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* ─── All Movies Grid ───────────────────────────────────── */}
        {!isLoading && (
          <div>
            {featured.length > 0 && (
              <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-6">
                <Film size={20} className="text-purple-400" />
                {activeTab === 'now_showing' ? 'All Movies' : 'Upcoming Releases'}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {(featured.length > 0 ? [...featured.slice(3), ...rest] : rest).map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
              {data?.length === 0 && (
                <div className="col-span-full py-20 text-center text-text-muted">
                  <Film size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No movies found matching your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Featured Movie Card (wide) ───────────────────────────────
function FeaturedMovieCard({ movie, index }: { movie: Movie; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/movies/${movie.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] mb-4">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/30 flex items-center justify-center">
              <Film size={48} className="text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider">
              {movie.cbfc_rating}
            </span>
            {movie.is_featured && (
              <span className="bg-amber-500 text-black text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wider flex items-center gap-1">
                <Flame size={10} /> Hit
              </span>
            )}
          </div>

          {movie.imdb_rating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
              <Star size={12} className="text-amber-400" fill="currentColor" />
              <span className="text-white text-xs font-bold">{movie.imdb_rating}</span>
            </div>
          )}

          {/* Bottom Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-display font-bold text-xl mb-1 line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="flex items-center gap-1"><Clock size={12} />{movie.duration_minutes}m</span>
              <span>{movie.language}</span>
              <span>{movie.genre.slice(0, 2).join(' • ')}</span>
            </div>
          </div>

          {/* Hover CTA */}
          <div className="absolute inset-0 bg-purple-600/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl transform group-hover:scale-100 scale-90 transition-transform">
              Book Tickets <ChevronRight size={18} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Regular Movie Card (portrait) ───────────────────────────
function MovieCard({ movie, index }: { movie: Movie; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/movies/${movie.id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden aspect-[2/3] mb-3">
          {movie.poster_url ? (
            <img
              src={movie.poster_url}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-surface-700 flex flex-col items-center justify-center gap-2">
              <Film size={36} className="text-white/20" />
              <span className="text-xs text-white/30 text-center px-2">{movie.title}</span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <div className="w-full bg-purple-600 text-white text-xs font-bold py-2 rounded-lg text-center">
              {movie.status === 'now_showing' ? 'Book Now' : 'Notify Me'}
            </div>
          </div>

          {/* CBFC rating */}
          <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
            {movie.cbfc_rating}
          </div>

          {movie.imdb_rating && (
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
              <Star size={10} className="text-amber-400" fill="currentColor" />
              <span className="text-white text-[10px] font-bold">{movie.imdb_rating}</span>
            </div>
          )}
        </div>

        <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-purple-400 transition-colors mb-1">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span>{movie.language}</span>
          <span>•</span>
          <span>{movie.genre[0]}</span>
          {movie.status === 'coming_soon' && (
            <span className="text-purple-400 font-bold">Soon</span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
