'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Film, ChevronRight, Star, Clock, Flame } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Movie {
  id: string
  title: string
  poster_url: string | null
  imdb_rating: number | null
  duration_minutes: number
  genre: string[]
  language: string
}

export function FeaturedMovies() {
  const { data: movies, isLoading } = useQuery({
    queryKey: ['featuredMovies'],
    queryFn: async () => {
      const res = await api.get<{ data: { items: Movie[] } }>('/movies?status=now_showing&featured=true&limit=6')
      return res.data.data.items.slice(0, 5) // Show top 5
    },
  })

  if (isLoading) {
    return (
      <section className="section py-20">
        <div className="flex justify-between items-end mb-10">
          <div className="skeleton h-10 w-64 rounded-lg" />
          <div className="skeleton h-6 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton aspect-[2/3] rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  if (!movies || movies.length === 0) return null

  return (
    <section className="section py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-brand-500 font-bold uppercase tracking-widest text-xs mb-3">
            <Flame size={14} />
            Blockbuster Hits
          </div>
          <h2 className="text-4xl font-display font-bold text-white">Now Showing in Cinemas</h2>
        </div>
        <Link 
          href="/movies" 
          className="group flex items-center gap-2 text-text-muted hover:text-white transition-colors font-bold"
        >
          View all movies
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {movies.map((movie, i) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <Link href={`/movies/${movie.id}`} className="group block">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-lg shadow-black/20">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-800 flex items-center justify-center">
                    <Film size={48} className="text-surface-600" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full btn-primary py-2 text-xs">Book Now</div>
                </div>

                {/* IMDB Badge */}
                {movie.imdb_rating && (
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star size={12} className="text-amber-400" fill="currentColor" />
                    <span className="text-white text-xs font-bold">{movie.imdb_rating}</span>
                  </div>
                )}
              </div>
              
              <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-brand-400 transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 text-text-muted text-xs">
                <span>{movie.language}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {movie.duration_minutes}m
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
