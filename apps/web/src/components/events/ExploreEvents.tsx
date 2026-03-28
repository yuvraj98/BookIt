'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, IndianRupee, Search, Filter } from 'lucide-react'
import { EventCategory } from '@bookit/types'

const CATEGORIES = [
  'All', 'comedy', 'music', 'sports', 'workshop', 'theatre', 'food', 'art', 'others'
]

interface EventItem {
  id: string
  title: string
  category: string
  city: string
  venue_name: string
  starts_at: string
  poster_url: string | null
  min_price: number
  organisers: { business_name: string }
}

export function ExploreEvents({ initialCategory }: { initialCategory?: string }) {
  const [category, setCategory] = useState(initialCategory || 'All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [city, setCity] = useState('Pune')

  // Simple debounce
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)
    return () => clearTimeout(handler)
  }, [search])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['events', category, debouncedSearch, city],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (category !== 'All') params.append('category', category)
      if (debouncedSearch) params.append('search', debouncedSearch)
      if (city) params.append('city', city)
      
      const res = await api.get<{ data: { items: EventItem[] } }>(`/events?${params.toString()}`)
      return res.data.data.items
    },
  })

  return (
    <div className="animate-in">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          Discover <span className="text-gradient">Experiences</span>
        </h1>
        <p className="text-text-muted text-lg max-w-2xl">
          From laugh-out-loud comedy to electrifying concerts, book your next unforgettable moment.
        </p>
      </div>

      {/* ─── Filters & Search ──────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
        {/* Categories (Scrollable pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar mask-gradient-right">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-surface-800 text-text-muted hover:bg-surface-700 border border-border/50'
              }`}
            >
              {cat === 'All' ? cat : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Search & Location */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 py-2.5 bg-surface-800/50"
            />
          </div>
          <select 
            className="input py-2.5 w-32 bg-surface-800/50 app-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="Pune">Pune</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
          </select>
        </div>
      </div>

      {/* ─── Results Grid ──────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-48 skeleton" />
              <div className="p-4 space-y-3">
                <div className="h-6 w-3/4 skeleton rounded" />
                <div className="h-4 w-1/2 skeleton rounded" />
                <div className="h-4 w-1/3 skeleton rounded mb-4" />
                <div className="h-10 w-full skeleton rounded-xl mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-red-400">Failed to load events. Please try again.</p>
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl bg-surface-800/20">
          <div className="bg-surface-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="text-brand-500" size={24} />
          </div>
          <h3 className="text-xl font-display font-bold mb-2">No events found</h3>
          <p className="text-text-muted">Try adjusting your filters or search term.</p>
          <button 
            onClick={() => { setCategory('All'); setSearch(''); setCity('Pune'); }}
            className="mt-6 btn-secondary bg-surface-800 hover:bg-surface-700"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="group card overflow-hidden hover:-translate-y-1 block bg-surface-800/40">
              <div className="aspect-[4/3] relative overflow-hidden bg-surface-700">
                {event.poster_url ? (
                  <Image
                    src={event.poster_url}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-900/40 text-brand-500">
                    <span className="font-display font-bold text-lg opacity-50 text-center px-4">{event.title}</span>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="badge-brand backdrop-blur-md bg-surface-900/80 capitalize">
                    {event.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-brand-500 transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-text-muted gap-2">
                    <Calendar size={14} className="text-brand-500/80" />
                    <span>{new Date(event.starts_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center text-sm text-text-muted gap-2">
                    <MapPin size={14} className="text-blue-400/80" />
                    <span className="truncate">{event.venue_name}, {event.city}</span>
                  </div>
                </div>

                <div className="divider mb-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-text-subtle block mb-1">Starts from</span>
                    <div className="flex items-center text-lg font-bold font-display text-white">
                      <IndianRupee size={16} className="mr-0.5 opacity-80" />
                      {event.min_price}
                    </div>
                  </div>
                  <div className="btn-primary py-2 px-4 shadow-none group-hover:shadow-glow text-sm">
                    Book Now
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
